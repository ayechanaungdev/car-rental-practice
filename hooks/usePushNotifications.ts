import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function usePushNotifications() {
    const { session } = useAuthStore();

    const registerForPushNotificationsAsync = async () => {
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
            
            if (!projectId) {
              console.log('❌ Project ID not found in app.json. Add it to get Push Tokens!');
              return;
            }
            console.log('✅ Project ID found:', projectId);

            const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('🎫 Expo Push Token generated:', pushTokenString);

            // Save token to Supabase Profile immediately
            if (session?.user?.id) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ expo_push_token: pushTokenString })
                    .eq('id', session.user.id);
                
                if (error) {
                    console.error('❌ Failed to save push token to Supabase:', error.message);
                } else {
                    console.log('✅ Push Token saved to Supabase successfully');
                }
            } else {
                console.log('⚠️ No active session found to save push token');
            }

            return pushTokenString;
        } catch (e: unknown) {
            console.log(e);
        }
    };

    return { registerForPushNotificationsAsync };
}
