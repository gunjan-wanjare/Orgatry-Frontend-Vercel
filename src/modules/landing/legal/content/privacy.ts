import type { LegalPageContent } from '@/modules/landing/legal/types';

export const privacyPolicyContent: LegalPageContent = {
  badge: 'Legal',
  title: 'Privacy Policy',
  subtitle:
    'Learn how Orgatry collects, uses, stores, and protects your personal information.',
  intro:
    'This Privacy Policy describes how Orgatry collects, uses, stores, and protects your personal information when you use our website, products, or services.',
  documentTitle: 'Privacy Policy | Orgatry',
  documentDescription:
    'Learn how Orgatry collects, stores, and protects your personal information.',
  sections: [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      blocks: [
        {
          type: 'list',
          items: [
            'Name and contact information such as email address and phone number.',
            'Business information provided during inquiries or onboarding.',
            'Device information, browser details, IP address, and usage analytics.',
            'Communications exchanged with our team.'
          ]
        }
      ]
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      blocks: [
        {
          type: 'list',
          items: [
            'To provide and improve our services.',
            'To respond to inquiries and customer support requests.',
            'To communicate important updates regarding our services.',
            'To enhance website performance and user experience.',
            'To comply with applicable legal obligations.'
          ]
        }
      ]
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may share information with trusted technology providers and service partners who help operate our business.'
        },
        {
          type: 'paragraph',
          text: 'We do not sell your personal information to third parties.'
        },
        {
          type: 'paragraph',
          text: 'Information may also be disclosed where required by applicable law.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      blocks: [
        {
          type: 'paragraph',
          text: 'We implement reasonable administrative, technical, and organizational security measures to protect your information.'
        },
        {
          type: 'paragraph',
          text: 'Although we strive to safeguard all data, no online transmission or storage method can be guaranteed to be completely secure.'
        }
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      blocks: [
        {
          type: 'paragraph',
          text: 'Depending on applicable laws, you may request:'
        },
        {
          type: 'list',
          items: [
            'Access to your information',
            'Correction of inaccurate information',
            'Deletion of personal information',
            'Withdrawal of consent where applicable'
          ]
        }
      ]
    },
    {
      id: 'contact-information',
      title: 'Contact Information',
      blocks: [
        {
          type: 'definition',
          entries: [
            { label: 'Company', value: 'Orgatry' },
            { label: 'Email', value: 'contact@orgatry.com' },
            { label: 'Last Updated', value: 'July 2026' }
          ]
        }
      ]
    }
  ]
};
