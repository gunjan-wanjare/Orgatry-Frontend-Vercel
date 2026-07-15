import { termsAndConditionsContent } from '@/modules/landing/legal/content/terms';
import { LegalDocumentPage } from '@/modules/landing/legal/components/LegalDocumentPage';

export function TermsAndConditionsPage() {
  return <LegalDocumentPage content={termsAndConditionsContent} />;
}
