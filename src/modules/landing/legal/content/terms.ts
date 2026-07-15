import type { LegalPageContent } from '@/modules/landing/legal/types';

export const termsAndConditionsContent: LegalPageContent = {
  badge: 'Legal',
  title: 'Terms & Conditions',
  subtitle:
    'Please read these terms carefully before using the Orgatry website and services.',
  intro:
    'By accessing or using the Orgatry website or services, you agree to these Terms & Conditions.\n\nIf you do not agree with these terms, please discontinue using the website.',
  documentTitle: 'Terms & Conditions | Orgatry',
  documentDescription:
    "Read the Terms & Conditions governing the use of Orgatry's website and services.",
  sections: [
    {
      id: 'services',
      title: 'Services',
      blocks: [
        {
          type: 'paragraph',
          text: 'Orgatry provides technology solutions, software products, consulting services, and digital platforms.'
        },
        {
          type: 'paragraph',
          text: 'Service availability may change without prior notice.'
        }
      ]
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users agree to:'
        },
        {
          type: 'list',
          items: [
            'Provide accurate information.',
            'Use the platform lawfully.',
            'Avoid unauthorized access attempts.',
            'Avoid disrupting website functionality.',
            'Respect intellectual property rights.'
          ]
        }
      ]
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      blocks: [
        {
          type: 'paragraph',
          text: 'All website content including:'
        },
        {
          type: 'list',
          items: [
            'Logos',
            'Branding',
            'Graphics',
            'Designs',
            'Software',
            'Source code',
            'Documentation'
          ]
        },
        {
          type: 'paragraph',
          text: 'remain the exclusive property of Orgatry unless otherwise stated.'
        },
        {
          type: 'paragraph',
          text: 'No content may be copied, reproduced, distributed, or modified without written permission.'
        }
      ]
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of Liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'Services are provided on an "as-is" and "as-available" basis.'
        },
        {
          type: 'paragraph',
          text: 'Orgatry shall not be liable for indirect, incidental, or consequential damages arising from the use of the website or services.'
        }
      ]
    },
    {
      id: 'changes-to-terms',
      title: 'Changes to Terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'Orgatry reserves the right to update these Terms & Conditions at any time.'
        },
        {
          type: 'paragraph',
          text: 'Continued use of the website constitutes acceptance of the revised terms.'
        }
      ]
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms shall be governed by the applicable laws of India.'
        },
        {
          type: 'paragraph',
          text: 'Any disputes shall fall under the exclusive jurisdiction of the competent courts in India.'
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
