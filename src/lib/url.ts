import type { Lang } from '../i18n/dict';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (p: string) => base + p;
/** Language-aware path: lp('ko', '/about/') -> /Mono/ko/about/ */
export const lp = (lang: Lang, p: string) => u((lang === 'ko' ? '/ko' : '') + p);
