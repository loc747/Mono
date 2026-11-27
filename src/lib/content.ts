import { supabase } from './supabase';
import { h, tile } from './dom';
import { msg } from './i18n';

/** Replace the static placeholder grid with published rows from Supabase, if there are any. */
export async function hydrateStudies(el: HTMLElement | null) {
  if (!el || !supabase) return;
  const { data } = await supabase.from('studies').select('*').eq('published', true).order('sort').order('created_at', { ascending: false });
  if (!data?.length) return;
  el.replaceChildren(...data.map((s: any) =>
    h('div', {}, tile({ label: s.label, title: s.title, bg: s.bg, fg: s.fg, img: s.image_url }), s.description && h('p', { class: 'mt-3 text-ink/75' }, s.description))));
}

export async function hydrateArchive(el: HTMLElement | null) {
  if (!el || !supabase) return;
  const { data } = await supabase.from('archive_items').select('*').eq('published', true).order('sort').order('created_at', { ascending: false });
  if (!data?.length) return;
  el.replaceChildren(...data.map((i: any) => {
    const wrap = h('div', { 'data-cat': i.category }, tile({ label: i.label, title: i.title, bg: i.bg, fg: i.fg }));
    return wrap;
  }));
}

export async function hydrateLooks(el: HTMLElement | null) {
  if (!el || !supabase) return;
  const { data } = await supabase.from('submissions').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(12);
  if (!data?.length) return;
  el.replaceChildren(...data.map((s: any) =>
    tile({ label: msg().by + s.author_name, title: s.title, bg: '#111111', fg: '#ffffff', img: s.image_url, sub: s.description })));
}
