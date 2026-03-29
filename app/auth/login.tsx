// app/auth/login.tsx
import { supabase } from '@/lib/supabase';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Pressable } from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CarIcon, EyeOffIcon } from 'lucide-react-native';

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
    <Box className="flex-1 bg-white relative">

      {/* 0. Background Car Overlay */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=600&auto=format&fit=crop' }}
        className="absolute bottom-0 w-full h-[60%] opacity-[0.05]"
        resizeMode="cover"
        alt="Background"
      />

      <VStack className="flex-1 px-8 pt-[72px] z-10 w-full border-box">

        {/* 1. Logo Section */}
        <VStack className="items-center space-y-2 mt-4">
          <CarIcon size={48} className="text-brand-500" strokeWidth={1.5} />
          <Heading className="text-typography-900 text-[11px] font-extrabold tracking-widest">
            CAR <Text className="text-brand-500 font-extrabold">RENTAL</Text> APP
          </Heading>

          <Heading className="text-brand-500 text-[26px] font-extrabold mt-8 tracking-tight">
            Sign in to your Account
          </Heading>
        </VStack>

        {/* 2. Form Section */}
        <VStack className="space-y-4 mt-8 w-full block">

          <FormControl className="w-full block">
            <FormControlLabel className="mb-2 w-full flex-row">
              <FormControlLabelText className="font-extrabold text-typography-900 text-[13px]">
                Email Address
              </FormControlLabelText>
              <Text className="text-error-500 font-bold ml-1 text-sm">*</Text>
            </FormControlLabel>
            <Input className="rounded-lg border-outline-300 h-12 bg-white/60 w-full mb-1">
              <InputField
                placeholder="Enter your email"
                className="text-[13px] placeholder:text-typography-400 font-medium"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Input>
          </FormControl>

          <FormControl className="w-full block">
            <FormControlLabel className="mb-2 w-full flex-row">
              <FormControlLabelText className="font-extrabold text-typography-900 text-[13px]">
                Password
              </FormControlLabelText>
              <Text className="text-error-500 font-bold ml-1 text-sm">*</Text>
            </FormControlLabel>
            <Input className="rounded-lg border-outline-300 h-12 bg-white/60 w-full mb-1">
              <InputField
                type="password"
                placeholder="Enter your password"
                className="text-[13px] placeholder:text-typography-400 font-medium"
                value={password}
                onChangeText={setPassword}
              />
              <InputSlot className="pr-4">
                <InputIcon as={EyeOffIcon} size="sm" className="text-typography-500" />
              </InputSlot>
            </Input>
          </FormControl>

          <Text className="text-brand-700 font-extrabold text-[13px] self-end mt-1 mb-2">
            Forgot Password?
          </Text>

          <Button
            className="bg-brand-500 rounded-lg h-[46px] w-full shadow-none mt-2"
            onPress={handleLogin}
            disabled={loading}
          >
            <ButtonText className="font-semibold text-white text-[15px] tracking-wide">
              {loading ? "Logging in..." : "Sign In"}
            </ButtonText>
          </Button>
        </VStack>

        {/* 3. Social Login Section */}
        <VStack className="mt-[52px] w-full items-center">

          <HStack className="items-center justify-center w-full mb-[32px]">
            <Box className="flex-1 h-[1px] bg-typography-300" />
            <Text className="text-brand-700 text-[13px] font-extrabold px-3">For New Renter</Text>
            <Box className="flex-1 h-[1px] bg-typography-300" />
          </HStack>

          <Button
            variant="outline"
            className="rounded-sm border-typography-500 h-[46px] w-full bg-white relative justify-center"
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Image
              source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
              className="w-[22px] h-[22px] absolute left-4"
              alt="Google"
            />
            <ButtonText className="text-brand-700 font-medium text-[15px]">Continue with Google</ButtonText>
          </Button>

          {/* FIX: Avoid using `<Link asChild>` directly on Gluestack `<Text>` which strips Navigation Context */}
          <Pressable onPress={() => router.push('/auth/signup')} className="mt-[44px]">
            <Text className="text-center text-[13px] font-extrabold text-typography-700">
              Or Create <Text className="text-brand-700 font-extrabold">New Account</Text>
            </Text>
          </Pressable>
        </VStack>

      </VStack>
    </Box>
  );
}