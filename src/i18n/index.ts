import type { AppLanguage } from '../types/quiz';
import { en, type TranslationDictionary, type TranslationKey } from './en';
import { mm } from './mm';

export type { TranslationDictionary, TranslationKey };
export { en, mm };
export * from './errors';

const DICTIONARIES: Record<AppLanguage, TranslationDictionary> = {
  en,
  mm,
};

function resolveKey(dict: TranslationDictionary, key: string): string {
  const parts = key.split('.');
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === 'string' ? current : key;
}

export function translate(
  lang: AppLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[lang] ?? DICTIONARIES.en;
  let template = resolveKey(dict, key);
  if (template === key && lang !== 'en') {
    template = resolveKey(DICTIONARIES.en, key);
  }
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, token: string) => {
    return Object.prototype.hasOwnProperty.call(params, token)
      ? String(params[token])
      : match;
  });
}
