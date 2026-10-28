import { useTranslation } from 'react-i18next';
import { isLanguage } from '../i18n';

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  return <div className="language-selector">
    <label className="sr-only" htmlFor="language-selector">{t('language.label')}</label>
    <select
      id="language-selector"
      value={i18n.resolvedLanguage || i18n.language}
      onChange={(event) => {
        const language = event.currentTarget.value;
        if (isLanguage(language)) void i18n.changeLanguage(language);
      }}
    >
      <option value="en" lang="en">English</option>
      <option value="fr" lang="fr">Français</option>
      <option value="hi" lang="hi">हिन्दी</option>
    </select>
  </div>;
}
