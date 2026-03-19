import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useRouter } from 'expo-router';
import { MessageSquareOff } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    conversations,
    isLoadingConversations,
    fetchConversations,
    subscribeToMessages,
  } = useChatStore();

  // Load conversations & start Realtime on mount
  useEffect(() => {
    if (!user?.id) return;
    fetchConversations(user.id);
    const unsubscribe = subscribeToMessages(user.id);
    return unsubscribe;
  }, [user?.id]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    if (user?.id) fetchConversations(user.id);
  }, [user?.id]);

  // Format relative time (e.g., "2m ago", "Yesterday")
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: typeof conversations[0] }) => (
    <Pressable
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      onPress={() => router.push(`/(protected)/chat/${item.partner_id}`)}
    >
      {/* Avatar */}
      <Image
        source={{ uri: item.partner_avatar || 'https://via.placeholder.com/48' }}
        className="w-12 h-12 rounded-full bg-gray-200"
      />

      {/* Name + Last message */}
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {item.partner_name}
          </Text>
          <Text className="text-xs text-gray-400">
            {formatTime(item.last_message_at)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm text-gray-500 flex-1 mr-2" numberOfLines={1}>
            {item.last_message}
          </Text>
          {item.unread_count > 0 && (
            <View className="bg-blue-500 rounded-full min-w-[20px] h-5 justify-center items-center px-1.5">
              <Text className="text-white text-xs font-bold">
                {item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  if (isLoadingConversations && conversations.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a8e3" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.partner_id}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={isLoadingConversations}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <MessageSquareOff size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-base">No messages yet</Text>
          </View>
        }
      />
    </View>
  );
}
