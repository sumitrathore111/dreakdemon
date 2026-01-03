import Editor from '@monaco-editor/react';
import { memo } from 'react';
import type { Language } from './types';
import { LANGUAGE_CONFIG } from './types';

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (code: string) => void;
  readOnly?: boolean;
  height?: string;
}

const CodeEditor = memo(({ code, language, onChange, readOnly = false, height = '400px' }: CodeEditorProps) => {
  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <Editor
        height={height}
        language={monacoLanguage}
        value={code}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          readOnly,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

interface LanguageSelectorProps {
  language: Language;
  onChange: (lang: Language) => void;
  disabled?: boolean;
}

export const LanguageSelector = ({ language, onChange, disabled }: LanguageSelectorProps) => {
  const languages: Language[] = ['python', 'javascript', 'cpp', 'java', 'c'];

  return (
    <select
      value={language}
      onChange={(e) => onChange(e.target.value as Language)}
      disabled={disabled}
      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 
                 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] disabled:opacity-50"
    >
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {LANGUAGE_CONFIG[lang].name}
        </option>
      ))}
    </select>
  );
};

export default CodeEditor;
