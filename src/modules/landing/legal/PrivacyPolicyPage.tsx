import { privacyPolicyContent } from '@/modules/landing/legal/content/privacy';
import { LegalDocumentPage } from '@/modules/landing/legal/components/LegalDocumentPage';

export function PrivacyPolicyPage() {
  return <LegalDocumentPage content={privacyPolicyContent} />;
}
