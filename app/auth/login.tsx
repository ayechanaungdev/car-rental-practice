// app/auth/login.tsx
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Pressable, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    // 1. Destructure 'session' from the result!
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login failed!', error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    // 2. THE FIX: Sync the session to the store manually before moving!
    // This prevents the "Race Condition" where the app redirects before the 
    // background listener has updated the Brain.
    if (session) {
      router.replace('/(protected)');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Button title={loading ? "Logging in..." : "Log In"} onPress={handleLogin} />
      <Link href="/auth/signup" asChild>
        <Pressable style={{ marginTop: 20 }}>
          <Text style={{ color: '#16a8e3', textAlign: 'center' }}>
            Don't have an account? Sign Up
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}