import { dict, type Lang } from '../i18n/dict';
import { lp } from './url';

/** Client-side helpers: the active language comes from <html lang>. */
export const pageLang = (): Lang => (document.documentElement.lang === 'ko' ? 'ko' : 'en');
export const msg = () => dict[pageLang()].msg;
export const cl = (path: string) => lp(pageLang(), path);
