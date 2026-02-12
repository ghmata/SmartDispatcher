"use client";

import { useState, useEffect } from "react";

export interface QuickTemplate {
  id: string;
  label: string;
  text: string;
  isCustom: boolean;
}

const DEFAULT_TEMPLATES: QuickTemplate[] = [
  {
    id: "default-1",
    label: "Amigável",
    text: "{Opa/Olá/Oi} [Nome], {tudo bem?/como vai?/tudo certo?}\n\nEstou passando para lembrar do seu boleto.\nSegue o link: [Link]",
    isCustom: false,
  },
  {
    id: "default-2",
    label: "Direta",
    text: "[Nome], referente ao seu débito: segue o link para pagamento [Link].\n\n{Qualquer dúvida estou à disposição/Aguardo confirmação}.",
    isCustom: false,
  },
  {
    id: "default-3",
    label: "Formal",
    text: "{Prezado(a)/Caro(a)} [Nome], entramos em contato referente a pendência financeira.\nPara regularizar, acesse: [Link].",
    isCustom: false,
  },
];

const API_URL = "http://127.0.0.1:3001/api/templates"; // Port might be dynamic but 3001 is default dev.
// Ideally, use a base URL helper if available, but for now hardcode/relative works in Next.js if proxied or static.
// Since this is Static Export + Separate Backend, we need the dynamic port from window.location if possible, or assume localhost.
// Actually, `getApiUrl()` helper should be used if it exists, or just relative `/api/...` if served by Express.
// In this architecture, Express serves Frontend, so `/api/templates` is correct.

export function useQuickTemplates() {
  const [templates, setTemplates] = useState<QuickTemplate[]>(DEFAULT_TEMPLATES);

  // Load from API on mount
  useEffect(() => {
    async function load() {
      try {
        // Anti-Cache: Append timestamp
        const res = await fetch(`/api/templates?_=${Date.now()}`);
        if (res.ok) {
          const customTemplates: QuickTemplate[] = await res.json();
          // Merge defaults with custom, avoiding duplicates if any
          setTemplates([...DEFAULT_TEMPLATES, ...customTemplates]);
        }
      } catch (e) {
        console.warn("Failed to load templates from API:", e);
      }
    }
    load();
  }, []);

  const addTemplate = async (label: string, text: string) => {
    const newTemplate: QuickTemplate = {
      id: crypto.randomUUID ? crypto.randomUUID() : `tmpl-${Date.now()}`,
      label,
      text,
      isCustom: true,
    };
    
    // Optimistic UI Update
    setTemplates(prev => [...prev, newTemplate]);

    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });
    } catch (e) {
      console.error("Failed to save template:", e);
    }
  };

  const updateTemplate = async (id: string, label: string, text: string) => {
    const updatedTmpl = { id, label, text, isCustom: true };
    
    setTemplates(prev => prev.map(t => 
      (t.id === id && t.isCustom) ? updatedTmpl : t
    ));

    try {
      await fetch('/api/templates', {
        method: 'POST', // Manager handles create/update via saveTemplate
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTmpl)
      });
    } catch (e) {
      console.error("Failed to update template:", e);
    }
  };

  const deleteTemplate = async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));

    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error("Failed to delete template:", e);
    }
  };

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
