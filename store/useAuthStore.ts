import { create } from 'zustand';

interface AuthState {
  session: any | null;
  user: any | null;
  role: 'renter' | 'owner' | null;
  setSession: (session: any) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  setSession: (session) => set({ session, user: session?.user }),
  signOut: () => set({ session: null, user: null, role: null }),
}));
