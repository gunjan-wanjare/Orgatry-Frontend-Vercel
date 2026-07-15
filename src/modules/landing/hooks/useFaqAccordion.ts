import { useCallback, useState } from 'react';

export type UseFaqAccordionResult = {
  openId: string | null;
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  open: (id: string) => void;
  close: () => void;
};

export function useFaqAccordion(initialOpenId: string | null = null): UseFaqAccordionResult {
  const [openId, setOpenId] = useState<string | null>(initialOpenId);

  const isOpen = useCallback((id: string) => openId === id, [openId]);

  const toggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  const open = useCallback((id: string) => {
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    setOpenId(null);
  }, []);

  return { openId, isOpen, toggle, open, close };
}
