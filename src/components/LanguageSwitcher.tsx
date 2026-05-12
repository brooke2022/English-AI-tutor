import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  return (
    <button
      onClick={() => i18n.changeLanguage(isZh ? 'en' : 'zh')}
      className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
    >
      {isZh ? 'EN' : '中'}
    </button>
  );
}
