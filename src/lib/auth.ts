import { supabase } from './supabase';
import { u } from './url';

export interface Profile {
  id: string; username: string; display_name: string; bio: string | null;
  avatar_url: string | null; role: 'member' | 'admin'; created_at: string;
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return (data as Profile) ?? null;
}

/** Send a signed-in user to the right place: onboarding if no profile, admin console, or profile. */
export async function routeAfterLogin() {
  const s = await getSession();
  if (!s) return;
  const p = await getProfile(s.user.id);
  location.replace(!p ? u('/profile/?welcome=1') : p.role === 'admin' ? u('/admin/') : u('/profile/'));
}

export async function signInWithGoogle() {
  if (!supabase) return { error: new Error('Backend not configured') };
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + u('/login/') },
  });
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return 'Use at least 10 characters.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Include both letters and numbers.';
  return null;
}

export const NOT_CONFIGURED =
  'The backend is not configured yet. Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY (see .env.example).';
