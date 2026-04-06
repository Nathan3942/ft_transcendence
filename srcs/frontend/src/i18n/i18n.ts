import { getItem, setItem } from "../helpers/localStoragehelper";
import en from "./locales/en";
import fr from "./locales/fr";

type Locale = "en" | "fr";

export type TranslationValue = string | { [key: string]: TranslationValue };
export type TranslationDict = { [key: string]: TranslationValue };

const translations: Record<Locale, TranslationDict> = { en, fr };

let currentLocale: Locale = (getItem("locale") as Locale) ?? "en";

export function t(key: string): string {
	return key.split(".").reduce<TranslationValue>((o, k) => {
		if (typeof o === "string")
			return o;
		return o[k];
	}, translations[currentLocale]) as string ?? key;
}

export function setLocale(locale: Locale) {
	currentLocale = locale;
	setItem("locale", locale);

	document.dispatchEvent(new CustomEvent("localeChanged"));
}