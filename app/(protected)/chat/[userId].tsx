import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function ChatScreen() {
    const { userId: partnerId } = useLocalSearchParams<{ userId: string }>();
    const { user } = useAuthStore();
    const {
        messages,
        isLoadingMessages,
        fetchMessages,
        sendMessage,
        markAsRead,
        subscribeToMessages,
    } = useChatStore();
    const navigation = useNavigation();
    const [text, setText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    // 1. Set header title to partner's name
    useEffect(() => {
        if (!partnerId) return;
        const fetchPartnerName = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', partnerId)
                .single();
            if (data?.full_name) {
                navigation.setOptions({ title: data.full_name });
            }
        };
        fetchPartnerName();
    }, [partnerId]);

    // 2. Fetch messages & subscribe to Realtime
    useEffect(() => {
        if (!user?.id || !partnerId) return;
        fetchMessages(user.id, partnerId);
        markAsRead(user.id, partnerId);
        const unsubscribe = subscribeToMessages(user.id);
        return unsubscribe;
    }, [user?.id, partnerId]);

    // 3. Auto-scroll when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    // 4. Send handler
    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed || !user?.id || !partnerId) return;
        setText('');
        await sendMessage(user.id, partnerId, trimmed);
    };

    // 5. Format timestamp (e.g., "3:42 PM")
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderMessage = ({ item }: { item: typeof messages[0] }) => {
        const isMine = item.sender_id === user?.id;
        return (
            <View
                className={`mx-3 my-1 max-w-[75%] ${isMine ? 'self-end' : 'self-start'}`}
            >
                <View
                    className={`px-3 py-2 rounded-2xl ${isMine
                        ? 'bg-blue-500 rounded-br-sm'
                        : 'bg-gray-200 rounded-bl-sm'
                        }`}
                >
                    <Text className={isMine ? 'text-white' : 'text-gray-900'}>
                        {item.content}
                    </Text>
                </View>
                <Text
                    className={`text-[10px] text-gray-400 mt-0.5 ${isMine ? 'text-right mr-1' : 'ml-1'
                        }`}
                >
                    {formatTime(item.created_at)}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={{ paddingVertical: 8 }}
                onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: false })
                }
            />

            {/* Input Bar */}
            <View className="flex-row items-center px-3 py-2 border-t border-gray-200 bg-white">
                <TextInput
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base mr-2"
                    placeholder="Type a message..."
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={1000}
                />
                <Pressable
                    onPress={handleSend}
                    disabled={!text.trim()}
                    className="w-10 h-10 rounded-full bg-blue-500 justify-center items-center"
                    style={{ opacity: text.trim() ? 1 : 0.4 }}
                >
                    <Send size={18} color="white" />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}
