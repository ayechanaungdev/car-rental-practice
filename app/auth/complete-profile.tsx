import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

export default function CompleteProfileScreen() {
    const router = useRouter();
    const { user, initialize } = useAuthStore();
    const [nrc, setNrc] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!nrc || !postalCode) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ nrc, postal_code: postalCode })
            .eq('id', user?.id);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            // Re-fetch profile in store so the Guard sees the updated data
            await initialize();
            router.replace('/(protected)/(tabs)');
        }
        setLoading(false);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Complete Your Profile
            </Text>
            <TextInput placeholder="NRC Number" value={nrc} onChangeText={setNrc} />
            <TextInput placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} />
            <Pressable onPress={handleUpdateProfile} disabled={loading}>
                <Text>{loading ? 'Saving...' : 'Save & Continue'}</Text>
            </Pressable>
        </View>
    );
}
