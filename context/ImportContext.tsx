import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { File as ExpoFile } from 'expo-file-system';
import { useLibrary } from './LibraryContext';
import { extractTextFromUrl, extractTextFromDocument } from '@/services/openai';

type ImportStatus = 'idle' | 'importing' | 'done' | 'error';

interface ImportUrlConfig {
  type: 'url';
  url: string;
  apiKey: string;
}

interface ImportFileConfig {
  type: 'file';
  fileUri: string;
  fileName: string;
  mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  itemType: 'PDF' | 'DOCX';
  apiKey: string;
}

type ImportConfig = ImportUrlConfig | ImportFileConfig;

interface ImportContextValue {
  status: ImportStatus;
  progressMessage: string;
  importedItemId: number | null;
  errorMessage: string;
  startImport: (config: ImportConfig) => void;
  dismiss: () => void;
}

const ImportContext = createContext<ImportContextValue | null>(null);

export function ImportProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progressMessage, setProgressMessage] = useState('');
  const [importedItemId, setImportedItemId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { addItem } = useLibrary();
  const addItemRef = useRef(addItem);
  addItemRef.current = addItem;

  const dismiss = useCallback(() => {
    setStatus('idle');
    setProgressMessage('');
    setImportedItemId(null);
    setErrorMessage('');
  }, []);

  const startImport = useCallback((config: ImportConfig) => {
    if (status === 'importing') return;

    setStatus('importing');
    setImportedItemId(null);
    setErrorMessage('');

    if (config.type === 'url') {
      setProgressMessage('Fetching page content...');

      (async () => {
        try {
          setProgressMessage('Extracting text with AI...');
          const extraction = await extractTextFromUrl(config.url, config.apiKey);
          if (!extraction.success) {
            setStatus('error');
            setErrorMessage(extraction.error || 'Failed to extract text from URL');
            setProgressMessage('');
            return;
          }
          const lines = extraction.text.split('\n');
          const extractedTitle =
            lines[0]?.length > 0 && lines[0].length < 200
              ? lines[0]
              : new URL(config.url).hostname;
          const newId = addItemRef.current({
            type: 'LINK',
            title: extractedTitle,
            content: extraction.text,
          });
          setStatus('done');
          setProgressMessage('');
          setImportedItemId(newId);
        } catch {
          setStatus('error');
          setErrorMessage('Failed to fetch URL content');
          setProgressMessage('');
        }
      })();
    }

    if (config.type === 'file') {
      setProgressMessage('Reading file...');

      (async () => {
        try {
          const file = new ExpoFile(config.fileUri);
          const base64 = await file.base64();
          setProgressMessage('Extracting text with AI...');
          const extraction = await extractTextFromDocument(
            base64,
            config.apiKey,
            config.mimeType,
            config.fileName,
          );
          if (!extraction.success) {
            setStatus('error');
            setErrorMessage(extraction.error || 'Failed to extract text from file');
            setProgressMessage('');
            return;
          }
          const newId = addItemRef.current({
            type: config.itemType,
            title: config.fileName.replace(/\.(pdf|docx)$/i, ''),
            content: extraction.text,
          });
          setStatus('done');
          setProgressMessage('');
          setImportedItemId(newId);
        } catch {
          setStatus('error');
          setErrorMessage('Failed to extract text from file');
          setProgressMessage('');
        }
      })();
    }
  }, [status]);

  return (
    <ImportContext.Provider
      value={{ status, progressMessage, importedItemId, errorMessage, startImport, dismiss }}
    >
      {children}
    </ImportContext.Provider>
  );
}

export function useImport() {
  const ctx = useContext(ImportContext);
  if (!ctx) throw new Error('useImport must be used within ImportProvider');
  return ctx;
}
