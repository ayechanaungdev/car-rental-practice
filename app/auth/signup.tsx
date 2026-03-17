// app/auth/signup.tsx
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nrc, setNrc] = useState('');
  const [gender, setGender] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleSignup = async () => {
    if (!fullName || !email || !password || !nrc || !gender || !postalCode) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          nrc, gender, postal_code: postalCode,
          role: 'user'
        }
      }
    });

    if (error) {
      Alert.alert('Signup failed!', error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    // Redirect to Verify Screen with the email
    router.push({ pathname: '/auth/verify', params: { email } });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Join Us</Text>
      <TextInput placeholder="Full Name" value={fullName} onChangeText={setFullName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="NRC Number" value={nrc} onChangeText={setNrc} style={styles.input} />
      <TextInput placeholder="Gender" value={gender} onChangeText={setGender} style={styles.input} />
      <TextInput placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} style={styles.input} />
      <Button title={loading ? "Sending Code..." : "Next"} onPress={handleSignup} />
    </ScrollView>
  );
}

const styles = { input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 } };
