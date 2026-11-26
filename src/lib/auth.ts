import { supabase } from './supabase';
import { cl, msg } from './i18n';

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
  location.replace(!p ? cl('/profile/?welcome=1') : p.role === 'admin' ? cl('/admin/') : cl('/profile/'));
}

export async function signInWithGoogle() {
  if (!supabase) return { error: new Error(msg().notConfigured) };
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + cl('/login/') },
  });
}

export function passwordProblem(pw: string): string | null {
  const m = msg();
  if (pw.length < 10) return m.pwShort;
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return m.pwMix;
  return null;
}
