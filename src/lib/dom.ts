type Child = Node | string | null | undefined | false | Child[];

/** Build DOM nodes without innerHTML so user-supplied content can never inject markup. */
export function h(tag: string, props: Record<string, any> = {}, ...kids: Child[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value') (el as any).value = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  const add = (c: Child) => { if (Array.isArray(c)) c.forEach(add); else if (c != null && c !== false) el.append(c); };
  kids.forEach(add);
  return el;
}
export const safeColor = (c: string, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(c) ? c : fallback);
export const safeUrl = (s?: string | null) => (s && /^https:\/\//.test(s) ? s : '');

export function tile(o: { label: string; title: string; bg: string; fg: string; img?: string | null; sub?: string; cat?: string }) {
  const bg = safeColor(o.bg, '#111111'), fg = safeColor(o.fg, '#ffffff');
  const img = safeUrl(o.img);
  const el = h('article', { class: 'tile aspect-[4/5] p-5 md:p-6 flex flex-col justify-between', style: `--tile-bg:${bg};--tile-fg:${fg}` },
    img && h('img', { src: img, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer', class: 'absolute inset-0 w-full h-full object-cover' }),
    h('p', { class: 'eyebrow opacity-80 relative z-10' }, o.label),
    h('div', { class: 'relative z-10' },
      h('h3', { class: `display text-3xl md:text-4xl ${img ? 'bg-black/60 text-white inline px-2 py-1 box-decoration-clone' : ''}` }, o.title),
      o.sub && h('p', { class: 'mt-2 text-sm opacity-80' }, o.sub)));
  return el;
}
