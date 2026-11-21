import type { AppLanguage } from '../types/quiz';

export interface LocalizedText {
  en: string;
  mm: string;
}

export type ErrorCode =
  | 'INVALID_ROOM_PIN'
  | 'ROOM_NOT_FOUND'
  | 'QUIZ_NOT_FOUND'
  | 'ATTEMPT_NOT_FOUND'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'EMPTY_FILE'
  | 'GENERATION_FAILED'
  | 'EXPORT_FAILED'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_DISABLED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export const ERROR_MESSAGES: Record<ErrorCode, LocalizedText> = {
  INVALID_ROOM_PIN: {
    en: 'Please enter a valid 6-digit Room PIN (e.g. 482 619).',
    mm: 'မှန်ကန်သော ဂဏန်း ၆ လုံးပါ Room PIN ကို ထည့်သွင်းပါ (ဥပမာ 482 619)။'
  },
  ROOM_NOT_FOUND: {
    en: 'No active live room was found for that PIN.',
    mm: 'ထို PIN ဖြင့် ဖွင့်ထားသော Live Room ကို ရှာမတွေ့ပါ။'
  },
  QUIZ_NOT_FOUND: {
    en: 'The requested quiz could not be found.',
    mm: 'တောင်းဆိုထားသော Quiz ကို ရှာမတွေ့ပါ။'
  },
  ATTEMPT_NOT_FOUND: {
    en: 'The requested attempt record could not be found.',
    mm: 'တောင်းဆိုထားသော ဖြေဆိုမှုမှတ်တမ်းကို ရှာမတွေ့ပါ။'
  },
  UNSUPPORTED_FILE_TYPE: {
    en: 'Unsupported file format. Please upload a CSV, TXT, PDF, or DOCX file.',
    mm: 'ဖိုင်အမျိုးအစား မမှန်ကန်ပါ။ CSV, TXT, PDF သို့မဟုတ် DOCX ဖိုင်ကို တင်ပါ။'
  },
  FILE_TOO_LARGE: {
    en: 'The uploaded file is too large. Please choose a smaller file.',
    mm: 'တင်ထားသော ဖိုင်အရွယ်အစား ကြီးလွန်းနေပါသည်။ ပိုသေးသော ဖိုင်ကို ရွေးချယ်ပါ။'
  },
  EMPTY_FILE: {
    en: 'The uploaded file is empty or contains no readable study text.',
    mm: 'တင်ထားသော ဖိုင်သည် ဗလာဖြစ်နေသည် သို့မဟုတ် ဖတ်၍ရသော စာသားမပါဝင်ပါ။'
  },
  GENERATION_FAILED: {
    en: 'Could not generate questions from this document. Please try again.',
    mm: 'ဤဖိုင်မှ မေးခွန်းများ ထုတ်ယူ၍မရပါ။ ထပ်မံကြိုးစားကြည့်ပါ။'
  },
  EXPORT_FAILED: {
    en: 'Could not export the study sheet right now. Please try again.',
    mm: 'လေ့လာရန်စာရွက်ကို ယခုထုတ်ယူ၍မရပါ။ ထပ်မံကြိုးစားကြည့်ပါ။'
  },
  VALIDATION_ERROR: {
    en: 'Some fields are invalid. Please check your input and try again.',
    mm: 'ထည့်သွင်းထားသော အချက်အလက်အချို့ မမှန်ကန်ပါ။ ပြန်လည်စစ်ဆေးပြီး ထပ်ကြိုးစားပါ။'
  },
  UNAUTHORIZED: {
    en: 'Please sign in to continue.',
    mm: 'ဆက်လက်လုပ်ဆောင်ရန် အကောင့်ဝင်ရောက်ပါ။'
  },
  EMAIL_NOT_VERIFIED: {
    en: 'Please verify your email address before signing in.',
    mm: 'အကောင့်မဝင်မီ သင်၏အီးမေးလ်လိပ်စာကို အတည်ပြုပေးပါ။'
  },
  ACCOUNT_DISABLED: {
    en: 'This account has been deactivated by an administrator.',
    mm: 'ဤအကောင့်ကို စီမံခန့်ခွဲသူမှ ပိတ်ထားပါသည်။'
  },
  FORBIDDEN: {
    en: 'You do not have permission to perform this action.',
    mm: 'ဤလုပ်ဆောင်ချက်ကို ပြုလုပ်ရန် ခွင့်ပြုချက်မရှိပါ။'
  },
  RATE_LIMITED: {
    en: 'Too many requests. Please wait a moment and try again.',
    mm: 'တောင်းဆိုမှု အရမ်းများနေပါသည်။ ခဏစောင့်ပြီး ထပ်မံကြိုးစားပါ။'
  },
  NETWORK_ERROR: {
    en: 'Unable to reach the server. Please check your connection.',
    mm: 'ဆာဗာနှင့် ချိတ်ဆက်၍မရပါ။ အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။'
  },
  SERVER_ERROR: {
    en: 'Something went wrong on the server. Please try again later.',
    mm: 'ဆာဗာတွင် အမှားအယွင်းဖြစ်ပွားနေပါသည်။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။'
  },
  UNKNOWN_ERROR: {
    en: 'An unexpected error occurred. Please try again.',
    mm: 'မမျှော်လင့်ထားသော အမှားအယွင်းတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။ ထပ်မံကြိုးစားပါ။'
  }
};

export const HTTP_STATUS_MESSAGES: Record<number, LocalizedText> = {
  400: {
    en: 'Invalid request. Please check your input and try again.',
    mm: 'တောင်းဆိုမှု မမှန်ကန်ပါ။ ထည့်သွင်းထားသော အချက်အလက်များကို ပြန်စစ်ပါ။'
  },
  401: ERROR_MESSAGES.UNAUTHORIZED,
  403: ERROR_MESSAGES.FORBIDDEN,
  404: {
    en: 'The requested item could not be found.',
    mm: 'တောင်းဆိုထားသော အချက်အလက်ကို ရှာမတွေ့ပါ။'
  },
  408: {
    en: 'The request timed out. Please try again.',
    mm: 'တောင်းဆိုမှု အချိန်ကုန်သွားပါသည်။ ထပ်မံကြိုးစားပါ။'
  },
  413: ERROR_MESSAGES.FILE_TOO_LARGE,
  422: ERROR_MESSAGES.VALIDATION_ERROR,
  429: ERROR_MESSAGES.RATE_LIMITED,
  500: ERROR_MESSAGES.SERVER_ERROR,
  502: ERROR_MESSAGES.SERVER_ERROR,
  503: {
    en: 'The service is temporarily unavailable. Please try again shortly.',
    mm: 'ဝန်ဆောင်မှုကို ယာယီအသုံးပြု၍မရပါ။ ခဏအကြာတွင် ထပ်မံကြိုးစားပါ။'
  }
};

export interface ErrorLike {
  status?: number;
  code?: string;
  localizedMessage?: Partial<LocalizedText>;
  message?: string;
}

export function getErrorByCode(code: ErrorCode, lang: AppLanguage): string {
  return ERROR_MESSAGES[code][lang];
}

export function getLocalizedErrorMessage(
  error: unknown,
  lang: AppLanguage
): string {
  if (error && typeof error === 'object') {
    const err = error as ErrorLike;

    // 1. Semantic error code from backend or frontend
    if (err.code && err.code in ERROR_MESSAGES) {
      return ERROR_MESSAGES[err.code as ErrorCode][lang];
    }

    // 2. Backend-supplied localized message (message_en / message_mm)
    const directLocalized = err.localizedMessage?.[lang];
    if (directLocalized && directLocalized.trim()) {
      return directLocalized;
    }

    // 3. HTTP status code fallback (400, 404, 422, 500, etc.)
    if (typeof err.status === 'number') {
      if (err.status === 0) {
        return ERROR_MESSAGES.NETWORK_ERROR[lang];
      }
      if (err.status in HTTP_STATUS_MESSAGES) {
        return HTTP_STATUS_MESSAGES[err.status][lang];
      }
      if (err.status >= 500) {
        return ERROR_MESSAGES.SERVER_ERROR[lang];
      }
      if (err.status >= 400) {
        return HTTP_STATUS_MESSAGES[400][lang];
      }
    }
  }

  // Browser fetch network failure
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return ERROR_MESSAGES.NETWORK_ERROR[lang];
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR[lang];
}
