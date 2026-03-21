import { supabase } from '@/lib/supabase';
import { create } from 'zustand';

// The shape of a message row from our DB
interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

// A conversation = partner info + last message preview
interface Conversation {
    partner_id: string;
    partner_name: string;
    partner_avatar: string | null;
    last_message: string;
    last_message_at: string;
    unread_count: number;
}

interface ChatState {
    conversations: Conversation[];
    messages: Message[];
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    fetchConversations: (userId: string) => Promise<void>;
    fetchMessages: (userId: string, partnerId: string) => Promise<void>;
    sendMessage: (senderId: string, receiverId: string, content: string) => Promise<void>;
    markAsRead: (userId: string, partnerId: string) => Promise<void>;
    subscribeToMessages: (userId: string) => () => void; // Returns unsubscribe fn
    addIncomingMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    messages: [],
    isLoadingConversations: false,
    isLoadingMessages: false,

    // 1. Fetch all conversations for the current user
    fetchConversations: async (userId: string) => {
        set({ isLoadingConversations: true });

        // Get all messages where user is sender or receiver, ordered newest first
        const { data: allMessages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error || !allMessages) {
            console.error('Failed to fetch conversations:', error?.message);
            set({ isLoadingConversations: false });
            return;
        }

        // Group by partner to build conversation list
        const conversationMap = new Map<string, {
            lastMsg: Message;
            unreadCount: number;
        }>();

        for (const msg of allMessages) {
            const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
            if (!conversationMap.has(partnerId)) {
                conversationMap.set(partnerId, {
                    lastMsg: msg,
                    unreadCount: 0,
                });
            }
            // Count unread messages FROM partner
            if (msg.sender_id === partnerId && !msg.is_read) {
                const entry = conversationMap.get(partnerId)!;
                entry.unreadCount++;
            }
        }

        // Fetch partner profiles
        const partnerIds = Array.from(conversationMap.keys());
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', partnerIds);

        const profileMap = new Map(
            (profiles || []).map(p => [p.id, p])
        );

        // Build final conversation list
        const conversations: Conversation[] = partnerIds.map(partnerId => {
            const entry = conversationMap.get(partnerId)!;
            const profile = profileMap.get(partnerId);
            return {
                partner_id: partnerId,
                partner_name: profile?.full_name || 'Unknown User',
                partner_avatar: profile?.avatar_url || null,
                last_message: entry.lastMsg.content,
                last_message_at: entry.lastMsg.created_at,
                unread_count: entry.unreadCount,
            };
        });

        // Sort by latest message
        conversations.sort((a, b) =>
            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        );

        set({ conversations, isLoadingConversations: false });
    },

    // 2. Fetch messages between current user and a specific partner
    fetchMessages: async (userId: string, partnerId: string) => {
        set({ isLoadingMessages: true });

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(
                `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),` +
                `and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
            )
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Failed to fetch messages:', error.message);
        }

        set({ messages: data || [], isLoadingMessages: false });
    },

    // 3. Send a new message
    sendMessage: async (senderId: string, receiverId: string, content: string) => {
        const { data, error } = await supabase
            .from('messages')
            .insert({ sender_id: senderId, receiver_id: receiverId, content })
            .select()
            .single();

        if (error) {
            console.error('Failed to send message:', error.message);
            return;
        }

        // Optimistically add to local messages
        if (data) {
            set(state => ({ messages: [...state.messages, data] }));
        }

        // FOR PUSH NOTIFICATION
        // ==========================================
        // 👈 NEW: Fetch Push Token & Send via Expo
        // ==========================================
        const [receiverRes, senderRes] = await Promise.all([
            supabase.from('profiles').select('expo_push_token').eq('id', receiverId).single(),
            supabase.from('profiles').select('full_name').eq('id', senderId).single()
        ]);

        const pushToken = receiverRes.data?.expo_push_token;
        const senderName = senderRes.data?.full_name || 'Someone';

        // ==========================================
        // 👈 NEW: Save Notification to Database
        // ==========================================
        if (data) {
            await supabase.from('notifications').insert({
                receiver_id: receiverId,
                sender_id: senderId,
                reference_id: data.id, // The message ID
                title: `New message from ${senderName}`,
                body: content,
                type: 'message'
            });
        }

        // ==========================================
        // 👈 NEW: Send Push via Expo Push API
        // ==========================================
        if (pushToken) {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: pushToken,
                    sound: 'default',
                    title: `New message from ${senderName}`,
                    body: content,
                    data: { senderId: senderId, type: 'chat' },
                }),
            });
        }
    },


    // 4. Mark all messages from partner as read
    markAsRead: async (userId: string, partnerId: string) => {
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('sender_id', partnerId)
            .eq('receiver_id', userId)
            .eq('is_read', false);
    },

    // 5. Subscribe to new messages via Supabase Realtime
    subscribeToMessages: (userId: string) => {
        const channel = supabase
            .channel('messages-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${userId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    get().addIncomingMessage(newMsg);
                }
            )
            .subscribe();

        // Return cleanup function
        return () => {
            supabase.removeChannel(channel);
        };
    },

    // 6. Add incoming message to state (called by Realtime)
    addIncomingMessage: (message: Message) => {
        set(state => {
            // Add to messages if we're in the same chat
            const currentMessages = state.messages;
            const isInCurrentChat = currentMessages.length > 0 &&
                (currentMessages[0].sender_id === message.sender_id ||
                    currentMessages[0].receiver_id === message.sender_id);

            return {
                messages: isInCurrentChat
                    ? [...currentMessages, message]
                    : currentMessages,
            };
        });
    },

}));
