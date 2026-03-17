import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// We define what our "Brain" needs to remember here
interface AuthState {
  session: Session | null;
  user: User | null;
  role: string | null;           // Renters vs Owners
  isLoading: boolean;            // Are we checking the server right now?
  isVerifying: boolean;          // Are we verifying the OTP?
  setIsVerifying: (value: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({ // 👈 Added 'get' here to use in listener
  session: null,
  user: null,
  role: null,
  isLoading: true, // We start as 'loading' until we check Supabase
  isVerifying: false, // Default to false
  setIsVerifying: (value: boolean) => set({ isVerifying: value }),

  // Helpers to update variables
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, role: null });
  },

  // We will build initialize below
  initialize: async () => {
    set({ isLoading: true });

    // 1. Get current session
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, isLoading: false });

    // 2. Start the permanent background listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      // 👈 CRITICAL: Ignore all events if we are in "Silent Mode"
      if (get().isVerifying) {
        console.log('Auth Event Ignored (Silent Mode):', event);
        return;
      }

      console.log('Auth Event:', event);

      if (event === 'SIGNED_OUT') {
        set({ session: null, user: null, role: null });
        return;
      }

      set({ session, user: session?.user ?? null });

      // Look up VIP Pass (if they logged in)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        set({ role: profile?.role || null });
      }
    });
  },
}));
