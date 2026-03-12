import { Redirect } from 'expo-router';

export default function Index() {
  // Let the (protected) layout handle the session check
  return <Redirect href="/(tabs)" />;
}
