import { useAuthStore } from '@/store/useAuthStore';

// The root index is just a placeholder. 
// The Global Guard in app/_layout.tsx automatically handles "teleporting" users based on their session.
export default function Index() {
  const { isLoading } = useAuthStore();
  
  return null; 
}