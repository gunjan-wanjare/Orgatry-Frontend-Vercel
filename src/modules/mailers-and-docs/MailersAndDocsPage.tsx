import { useState } from 'react';
import { PageTransition } from '@/components/animations/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { WandSparkles, Plus } from 'lucide-react';
import { DocumentsTab } from '@/modules/offer-letters/OfferLettersPage';
import { TemplatesTab } from '@/modules/templates/TemplatesPage';

type Tab = 'documents' | 'templates';

export function MailersAndDocsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('documents');
  const [triggerGenerate, setTriggerGenerate] = useState(false);
  const [triggerCreate, setTriggerCreate] = useState(false);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Mailers & Docs"
          title="Documents & Templates"
          description="Generate documents from versioned templates, preview content, download PDFs, and track status."
          actions={
            activeTab === 'documents'
              ? (
                <Button onClick={() => setTriggerGenerate(true)}>
                  <WandSparkles className="size-4" /> Generate document
                </Button>
              )
              : (
                <Button onClick={() => setTriggerCreate(true)}>
                  <Plus className="size-4" /> Create template
                </Button>
              )
          }
        />

        <div className="flex gap-1 rounded-lg border border-border bg-slate-950/40 p-1 w-fit">
          {(['documents', 'templates'] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-white/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'documents' ? 'Documents' : 'Templates'}
            </button>
          ))}
        </div>

        {activeTab === 'documents' && (
          <DocumentsTab
            triggerGenerate={triggerGenerate}
            onGenerateHandled={() => setTriggerGenerate(false)}
          />
        )}
        {activeTab === 'templates' && (
          <TemplatesTab
            triggerCreate={triggerCreate}
            onCreateHandled={() => setTriggerCreate(false)}
          />
        )}
      </div>
    </PageTransition>
  );
}
