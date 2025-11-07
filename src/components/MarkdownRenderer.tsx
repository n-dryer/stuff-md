import React, { useMemo, useState, useEffect } from 'react';
import { logError } from '../utils/logger';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Lazy load marked and dompurify only when needed to reduce initial bundle size
let markedModule: unknown = null;
let dompurifyModule: unknown = null;

type MarkedLike = {
  parse: (content: string, options?: unknown) => string;
};

type DOMPurifyLike = {
  sanitize: (dirty: string, config?: unknown) => string;
};

// Simple HTML escape function for use before libraries load
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

const loadMarkdownLibs = async () => {
  if (!markedModule || !dompurifyModule) {
    const [marked, dompurify] = await Promise.all([
      import('marked'),
      import('dompurify'),
    ]);
    markedModule = marked;
    dompurifyModule = dompurify;
  }

  // marked can be exported as default or named export
  // It has a parse method available
  // Narrow unknown to MarkedLike by probing common export shapes
  type MarkedModule = {
    marked?: MarkedLike;
    default?: MarkedLike;
    parse?: (c: string, o?: unknown) => string;
  } & MarkedLike;

  type DOMPurifyModule = {
    default?: DOMPurifyLike;
  } & DOMPurifyLike;

  const anyMarked = markedModule as MarkedModule;
  const markedLib: MarkedLike = (anyMarked?.marked ||
    anyMarked?.default ||
    anyMarked) as MarkedLike;

  const anyDOMPurify = dompurifyModule as DOMPurifyModule;

  return {
    marked: markedLib,
    // Some versions expose parse at root in addition to .parse
    parse: ((anyMarked?.parse as
      | ((c: string, o?: unknown) => string)
      | undefined) ?? markedLib.parse) as (c: string, o?: unknown) => string,
    DOMPurify: (anyDOMPurify?.default || anyDOMPurify) as DOMPurifyLike,
  };
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  const [libs, setLibs] = useState<{
    marked: MarkedLike;
    parse: (content: string, options?: unknown) => string;
    DOMPurify: DOMPurifyLike;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load libraries on first render
  useEffect(() => {
    if (!libs && !loading) {
      setLoading(true);
      loadMarkdownLibs()
        .then(setLibs)
        .catch(error => {
          logError('Failed to load markdown libraries:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [libs, loading]);

  const sanitizedHtml = useMemo((): string => {
    if (!content) return '';

    // Show content as escaped plain text until libraries are loaded (safe)
    if (!libs) {
      // Escape HTML manually until libraries are loaded
      return escapeHtml(content);
    }

    try {
      // Use parse function if available, otherwise use marked directly
      const markedParse = libs.parse || libs.marked.parse;
      const rawHtml = markedParse(content, {
        gfm: true,
        breaks: true,
        headerIds: false, // avoid predictable anchors
        mangle: false, // keep emails intact without mangling
      }) as string;
      // Sanitize with strict URL policy - only allow safe schemes
      return libs.DOMPurify.sanitize(rawHtml, {
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|sms):)/i,
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'u',
          's',
          'code',
          'pre',
          'blockquote',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'a',
          'img',
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
      });
    } catch (error) {
      logError('Failed to render markdown:', error);
      return libs.DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
    }
  }, [content, libs]);

  return (
    <div
      className={`markdown-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default MarkdownRenderer;
