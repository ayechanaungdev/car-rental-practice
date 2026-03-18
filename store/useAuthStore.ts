import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// We define what our "Brain" needs to remember here
interface AuthState {
  session: Session | null;
  user: User | null;
  role: string | null;           // Renters vs Owners
  profile: any | null;           // 👈 NEW: Store full profile data
  isLoading: boolean;            // Are we checking the server right now?
  isVerifying: boolean;          // Are we verifying the OTP?
  setIsVerifying: (value: boolean) => void;
  getIsProfileIncomplete: () => boolean; // 👈 NEW: Helper to check completeness
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({ // 👈 Added 'get' here to use in listener
  session: null,
  user: null,
  profile: null,                 // 👈 NEW: Default to null
  role: null,
  isLoading: true, // We start as 'loading' until we check Supabase
  isVerifying: false, // Default to false
  setIsVerifying: (value: boolean) => set({ isVerifying: value }),

  // 👈 NEW: Check if profile is missing mandatory fields
  getIsProfileIncomplete: () => {
    const { profile } = get();
    return !!profile && (!profile.nrc || !profile.postal_code);
  },

  // Helpers to update variables
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, role: null, profile: null });
  },

  // We will build initialize below
  initialize: async () => {
    set({ isLoading: true });

    // 1. Get current session
    const { data: { session } } = await supabase.auth.getSession();

    // 1.5 Fetch profile synchronously to prevent gate-skipping
    let initialProfile = null;
    let initialRole = null;
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      initialProfile = data;
      initialRole = initialProfile?.role || null;
    }

    set({ session, user: session?.user ?? null, profile: initialProfile, role: initialRole, isLoading: false });

    // 2. Start the permanent background listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      // 👈 CRITICAL: Ignore all events if we are in "Silent Mode"
      if (get().isVerifying) {
        console.log('Auth Event Ignored (Silent Mode):', event);
        return;
      }

      console.log('Auth Event:', event);

      if (event === 'SIGNED_OUT') {
        set({ session: null, user: null, role: null, profile: null });
        return;
      }

      set({ session, user: session?.user ?? null });

      // Look up Profile (if they log in or token refreshes, and we don't have it)
      if (session?.user) {
        const currentProfile = get().profile;
        if (!currentProfile || currentProfile.id !== session.user.id) {
          
          // CRITICAL FIX: Do NOT await a database query directly inside the Auth listener! 
          // Supabase's internal auth mutex can deadlock if the query waits for a token that is currently being applied.
          // We use setTimeout to push the query to the end of the event loop after the listener finishes.
          setTimeout(async () => {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.log('Failed to fetch profile during auth change:', error.message);
            }
            set({ role: profile?.role || null, profile: profile || {} });
          }, 0);
        }
      }
    });
  },
}));
