import { useSyncExternalStore } from 'react';
import { DEMO_CUSTOMER_ID } from '../data/catalog';
import { supabase } from './supabase';

export type User = { id: string; name: string; email: string; phone: string; isAdmin: boolean };

type AuthState = { user: User | null; loading: boolean; recovering: boolean };

const LOCAL_KEY = 'tem_user';

const readLocalUser = (): User | null => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as Partial<User>;
    return { id: DEMO_CUSTOMER_ID, name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '', isAdmin: false };
  } catch {
    return null;
  }
};

const writeLocalUser = (u: User | null) => {
  try {
    if (u) localStorage.setItem(LOCAL_KEY, JSON.stringify(u));
    else localStorage.removeItem(LOCAL_KEY);
  } catch {
    /* storage unavailable */
  }
};

let state: AuthState = supabase ? { user: null, loading: true, recovering: false } : { user: readLocalUser(), loading: false, recovering: false };
const listeners = new Set<() => void>();
const set = (patch: Partial<AuthState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const loadProfile = async (id: string, email: string): Promise<User> => {
  const { data } = await supabase!.from('profiles').select('name, phone, is_admin').eq('id', id).maybeSingle();
  return { id, email, name: data?.name ?? '', phone: data?.phone ?? '', isAdmin: !!data?.is_admin };
};

if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    // Supabase warns against awaiting other Supabase calls inside this callback.
    setTimeout(async () => {
      if (event === 'PASSWORD_RECOVERY') set({ recovering: true });
      if (!session) return set({ user: null, loading: false });
      if (state.user?.id === session.user.id && event === 'TOKEN_REFRESHED') return;
      const user = await loadProfile(session.user.id, session.user.email ?? '');
      set({ user, loading: false });
    }, 0);
  });
}

export const getAuth = () => state;

export const useAuth = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );

/** Resolves to an error message, or null on success. */
type Result = Promise<string | null>;

export const signIn = async (email: string, password: string): Result => {
  if (!supabase) {
    const user = { id: DEMO_CUSTOMER_ID, name: 'Demo Customer', email, phone: '', isAdmin: false };
    writeLocalUser(user);
    set({ user });
    return null;
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? (error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message) : null;
};

/** `needsConfirmation` is true when the project requires email confirmation before sign-in. */
export const signUp = async (name: string, email: string, password: string): Promise<{ error: string | null; needsConfirmation: boolean }> => {
  if (!supabase) {
    const user = { id: DEMO_CUSTOMER_ID, name, email, phone: '', isAdmin: false };
    writeLocalUser(user);
    set({ user });
    return { error: null, needsConfirmation: false };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: window.location.origin + '/account' },
  });
  if (error) return { error: error.message, needsConfirmation: false };
  return { error: null, needsConfirmation: !data.session };
};

export const sendPasswordReset = async (email: string): Result => {
  if (!supabase) return null;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/account' });
  return error?.message ?? null;
};

export const updatePassword = async (password: string): Result => {
  if (!supabase) return null;
  const { error } = await supabase.auth.updateUser({ password });
  if (!error) set({ recovering: false });
  return error?.message ?? null;
};

export const clearRecovering = () => set({ recovering: false });

export const signOut = async () => {
  if (!supabase) {
    writeLocalUser(null);
    return set({ user: null });
  }
  await supabase.auth.signOut();
};

export const saveProfile = async (patch: { name: string; phone: string }): Result => {
  const user = state.user;
  if (!user) return 'Not signed in.';
  if (supabase) {
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
    if (error) return error.message;
  }
  const next = { ...user, ...patch };
  if (!supabase) writeLocalUser(next);
  set({ user: next });
  return null;
};
