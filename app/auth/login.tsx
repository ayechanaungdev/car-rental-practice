// app/auth/login.tsx
import { supabase } from '@/lib/supabase';
import * as AuthSession from 'expo-auth-session';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
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
    // NOTE: Manual router.replace removed; Root Layout handles it automatically.
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);

    // 1. Ask Supabase to give us the Google sign-in URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: AuthSession.makeRedirectUri(), // Expo handles the redirect
        skipBrowserRedirect: true, // We will open the browser manually
      },
    });

    if (error || !data.url) {
      Alert.alert('Error', error?.message || 'Could not start Google login.');
      setLoading(false);
      return;
    }

    // 2. Open the Google sign-in page in a browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      AuthSession.makeRedirectUri(),
    );

    // 3. If the user completed the flow, extract the session
    if (result.type === 'success') {
      const url = new URL(result.url);
      const params = new URLSearchParams(url.hash.substring(1)); // Get tokens from #fragment
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        // NOTE: Manual router.replace removed; Root Layout handles it automatically.
      }
    }
    setLoading(false);
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
      {/* Google Sign-In Button */}
      <Pressable
        onPress={handleGoogleLogin}
        style={{ marginTop: 20, padding: 12, backgroundColor: '#4285F4', borderRadius: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Sign in with Google
        </Text>
      </Pressable>
    </View>
  );
}