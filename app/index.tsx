import { useAuthStore } from '@/store/useAuthStore';

// The root index is just a placeholder.
// The Global Guard in app/_layout.tsx automatically handles "teleporting" users based on their session.
// (already commited in P03: add_google_signin_button_and_onboarding_gate)
export default function Index() {
  const { isLoading } = useAuthStore();

  return null; // 👈 NEW: Return null to let the Guard handle routing
}