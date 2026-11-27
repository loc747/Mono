import { supabase } from './supabase';
import { h } from './dom';

const BUCKET = 'uploads';
const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export type PickerText = { choose: string; hint: string; change: string; remove: string; badType: string; tooBig: string };

/** Problem with a file, or null if it can be uploaded. */
export const fileProblem = (f: File, t: PickerText) => (!EXT[f.type] ? t.badType : f.size > MAX_BYTES ? t.tooBig : null);

/** Upload to uploads/<folder>/<random>.<ext> and return the public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!supabase) throw new Error('not configured');
  const path = `${folder}/${crypto.randomUUID()}.${EXT[file.type]}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Best-effort delete of a file we uploaded (ignores URLs that aren't ours). */
export async function removeImage(url?: string | null) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  if (!supabase || !url || !url.includes(marker)) return;
  await supabase.storage.from(BUCKET).remove([decodeURIComponent(url.split(marker)[1])]);
}

/** Click-or-drop image field with preview. Colors follow currentColor so it works on light and dark. */
export function imagePicker(id: string, t: PickerText, current?: string | null) {
  let file: File | null = null;
  let removed = false;
  const input = h('input', { id, type: 'file', accept: 'image/png,image/jpeg,image/webp', class: 'sr-only' }) as HTMLInputElement;
  const img = h('img', { alt: '', class: 'w-full max-h-72 object-contain', hidden: true }) as HTMLImageElement;
  const title = h('span', { class: 'font-semibold' });
  const sub = h('span', { class: 'text-sm opacity-70' }, t.hint);
  const err = h('p', { role: 'status', class: 'text-sm mt-2' });
  const removeBtn = h('button', { type: 'button', class: 'text-sm underline underline-offset-4 mt-2', hidden: true }, t.remove);
  const zone = h('label', {
    for: id,
    class: 'mt-2 flex flex-col items-center justify-center gap-2 text-center border border-dashed border-current/50 p-6 cursor-pointer transition-colors hover:border-current focus-within:outline focus-within:outline-2',
  }, input, img, title, sub);

  let objUrl = '';
  const render = (src: string | null) => {
    img.hidden = !src;
    if (src) img.src = src;
    title.textContent = src ? t.change : t.choose;
    removeBtn.hidden = !src;
  };
  const take = (f?: File | null) => {
    err.textContent = '';
    if (!f) return;
    const p = fileProblem(f, t);
    if (p) { err.textContent = p; input.value = ''; return; }
    file = f; removed = false;
    if (objUrl) URL.revokeObjectURL(objUrl);
    objUrl = URL.createObjectURL(f);
    render(objUrl);
  };
  input.addEventListener('change', () => take(input.files?.[0]));
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('!border-current'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('!border-current'));
  zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('!border-current'); take(e.dataTransfer?.files?.[0]); });
  removeBtn.addEventListener('click', () => { file = null; removed = true; input.value = ''; err.textContent = ''; render(null); });
  render(current || null);

  return {
    el: h('div', {}, zone, removeBtn, err),
    file: () => file,
    /** true when an existing image was cleared and nothing new chosen */
    removed: () => removed && !file,
    reset: () => { file = null; removed = false; input.value = ''; render(null); },
  };
}
