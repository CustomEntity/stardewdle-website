export enum Locales {
	en = 'English',
	fr = 'Français',
	es = 'Español',
	de = 'Deutsch',
	it = 'Italiano',
	pt = 'Português',
	nl = 'Nederlands',
	pl = 'Polski',
	tr = 'Türkçe',
	ru = 'Русский',
	ar = 'العربية',
	he = 'עברית',
	fi = 'Suomi',
	id = 'Bahasa Indonesia',
	ms = 'Bahasa Melayu',
	vi = 'Tiếng Việt',
	th = 'ไทย',
	jp = '日本語',
	kr = '한국어',
	cn = '简体中文',
	cnt = '繁體中文'
}

export type LocaleCode = keyof typeof Locales;

export function findSupportedLocaleFromAcceptedLanguages(acceptedLanguageHeader: string | null) {
	const locales =
		acceptedLanguageHeader?.split(',')?.map((lang) => lang.split(';')[0].trim()) ?? [];
	for (const locale of locales) {
		const supportedLocale = getSupportedLocale(locale);
		if (supportedLocale) {
			return supportedLocale;
		}
	}
}

export function getSupportedLocale(userLocale: string | undefined) {
	if (!userLocale) {
		return 'en';
	}

	const matchedLocale = Object.keys(Locales).find((supportedLocale) => {
		return userLocale.includes(supportedLocale);
	});

	return (matchedLocale as LocaleCode) || 'en';
}