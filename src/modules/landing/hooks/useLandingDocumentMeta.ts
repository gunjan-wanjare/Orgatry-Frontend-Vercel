import { useEffect } from 'react';

const LANDING_TITLE = 'Orgatry — Smart HRMS Solutions';
const LANDING_DESCRIPTION =
  'Orgatry delivers smart HRMS solutions that streamline operations, empower employees, and drive business growth.';
const LANDING_OG_TITLE = 'Orgatry — Simplifying HR Management';
const LANDING_THEME = '#f3f3f5';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): HTMLMetaElement {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return el;
}

/**
 * Sets landing-specific document title, meta description, Open Graph placeholders,
 * and light-theme body classes for the duration of the landing route.
 */
export function useLandingDocumentMeta() {
  useEffect(() => {
    const previousTitle = document.title;
    const previousTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content;

    document.documentElement.classList.add('landing-root');
    document.body.classList.add('landing-body');
    document.title = LANDING_TITLE;

    upsertMeta('name', 'description', LANDING_DESCRIPTION);
    upsertMeta('name', 'theme-color', LANDING_THEME);
    upsertMeta('property', 'og:title', LANDING_OG_TITLE);
    upsertMeta('property', 'og:description', LANDING_DESCRIPTION);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', LANDING_OG_TITLE);
    upsertMeta('name', 'twitter:description', LANDING_DESCRIPTION);

    return () => {
      document.documentElement.classList.remove('landing-root');
      document.body.classList.remove('landing-body');
      document.title = previousTitle;
      if (previousTheme) {
        upsertMeta('name', 'theme-color', previousTheme);
      }
    };
  }, []);
}
