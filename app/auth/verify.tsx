// app/auth/verify.tsx
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore'; // 👈 Import store
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

export default function VerifyScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const { setIsVerifying } = useAuthStore(); // 👈 Get the setter
    const router = useRouter();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setLoading(true);

        // 1. Activate "Silent Mode" to prevent dashboard flicker
        setIsVerifying(true);

        const { error } = await supabase.auth.verifyOtp({
            email: email as string,
            token,
            type: 'signup',
        });

        if (error) {
            Alert.alert('Verification failed!', error.message);
            setIsVerifying(false); // Disable silent mode on error
            setLoading(false);
        } else {
            // 2. Sign Out silently while the store is ignoring events
            await supabase.auth.signOut();

            // 3. Disable Silent Mode and redirect
            setIsVerifying(false);

            Alert.alert('Success!', 'Account verified! You can now log in.');
            router.replace('/auth/login');
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Verify Email</Text>
            <Text style={{ marginBottom: 20 }}>Enter the 6-digit code sent to {email}</Text>
            <TextInput
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                value={token}
                onChangeText={setToken}
                style={{ borderWidth: 1, padding: 15, fontSize: 24, textAlign: 'center', marginBottom: 20, borderRadius: 8 }}
            />
            <Button title={loading ? "Verifying..." : "Verify & Finish"} onPress={handleVerify} />
        </View>
    );
}
