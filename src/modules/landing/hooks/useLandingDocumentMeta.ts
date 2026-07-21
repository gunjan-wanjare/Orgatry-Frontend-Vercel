import { useEffect } from 'react';

const LANDING_TITLE = 'Orgatry — Simplify and Scale Up Your Employee Lifecycle';
const LANDING_DESCRIPTION =
  'Orgatry delivers HR solutions and scalable HRMS software for workplaces built to grow.';
const LANDING_OG_TITLE = 'Orgatry — Simplify and Scale Up Your Employee Lifecycle';
const LANDING_THEME = '#f3f3f5';

export type LandingDocumentMetaOptions = {
  title?: string;
  description?: string;
  ogTitle?: string;
};

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
 * Sets landing / legal document title, meta description, Open Graph placeholders,
 * and light-theme body classes for the duration of the public marketing route.
 */
export function useLandingDocumentMeta(options?: LandingDocumentMetaOptions) {
  const title = options?.title ?? LANDING_TITLE;
  const description = options?.description ?? LANDING_DESCRIPTION;
  const ogTitle = options?.ogTitle ?? options?.title ?? LANDING_OG_TITLE;

  useEffect(() => {
    const previousTitle = document.title;
    const previousTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content;

    document.documentElement.classList.add('landing-root');
    document.body.classList.add('landing-body');
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'theme-color', LANDING_THEME);
    upsertMeta('property', 'og:title', ogTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', ogTitle);
    upsertMeta('name', 'twitter:description', description);

    return () => {
      document.documentElement.classList.remove('landing-root');
      document.body.classList.remove('landing-body');
      document.title = previousTitle;
      if (previousTheme) {
        upsertMeta('name', 'theme-color', previousTheme);
      }
    };
  }, [title, description, ogTitle]);
}
