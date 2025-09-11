/**
 * Code formatting utilities for rendering code blocks and terminal commands
 */

/**
 * Detect code blocks in text and format them with proper syntax highlighting
 * Supports both markdown-style code blocks and inline code
 */
export const formatCodeBlocks = (text: string): string => {
  if (!text) return '';

  // First, handle markdown-style code blocks with language specification
  // ```language
  // code
  // ```
  let formattedText = text.replace(
    /```([a-zA-Z0-9_+#-]+)?\s*\n([\s\S]*?)\n```/g,
    (_, language, code) => {
      const lang = language || 'plaintext';
      const preservedCode = preserveIndentation(code);
      return `<div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">${lang}</span>
          <button class="copy-button" onclick="copyCode(this)">Copy</button>
        </div>
        <pre class="code-block language-${lang}"><code>${escapeHtml(preservedCode)}</code></pre>
      </div>`;
    }
  );

  // Then handle code blocks without language specification
  // ```
  // code
  // ```
  formattedText = formattedText.replace(
    /```\s*\n([\s\S]*?)\n```/g,
    (_, code) => {
      const preservedCode = preserveIndentation(code);
      return `<div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">code</span>
          <button class="copy-button" onclick="copyCode(this)">Copy</button>
        </div>
        <pre class="code-block language-plaintext"><code>${escapeHtml(preservedCode)}</code></pre>
      </div>`;
    }
  );

  // Finally handle inline code with backticks (but not if it's part of a code block)
  formattedText = formattedText.replace(
    /(?<!<code[^>]*>)`([^`\n]+)`(?![^<]*<\/code>)/g,
    '<code class="inline-code">$1</code>'
  );

  return formattedText;
};

/**
 * Format terminal commands with special styling
 */
export const formatTerminalCommands = (text: string): string => {
  if (!text) return '';

  // Format terminal command blocks
  // $ command
  return text.replace(
    /\$\s+([^\n]+)/g,
    '<div class="terminal-command"><span class="terminal-prompt">$</span> <span class="terminal-text">$1</span></div>'
  );
};

/**
 * Process text to format both code blocks and terminal commands
 */
export const processFormattedText = (text: string): string => {
  if (!text) return '';
  
  // First format code blocks
  let processed = formatCodeBlocks(text);
  
  // Then format terminal commands
  processed = formatTerminalCommands(processed);
  
  return processed;
};

/**
 * Escape HTML special characters to prevent XSS
 */
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Detect if text contains code blocks
 */
export const containsCodeBlocks = (text: string): boolean => {
  if (!text) return false;
  return /```[\s\S]*?```/.test(text) || /`[^`]+`/.test(text);
};

/**
 * Extract language from a code block
 */
export const extractCodeLanguage = (codeBlock: string): string => {
  const match = codeBlock.match(/```([a-zA-Z0-9_]+)/);
  return match ? match[1] : 'plaintext';
};

/**
 * Preserve proper indentation in code blocks
 */
const preserveIndentation = (code: string): string => {
  if (!code) return '';
  
  const lines = code.split('\n');
  
  // Remove empty lines at the beginning and end
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  
  if (lines.length === 0) return '';
  
  // Find the minimum indentation (excluding empty lines)
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  if (nonEmptyLines.length === 0) return '';
  
  const minIndent = Math.min(
    ...nonEmptyLines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    })
  );
  
  // Remove the common indentation from all lines
  const normalizedLines = lines.map(line => {
    if (line.trim() === '') return ''; // Keep empty lines as empty
    return line.substring(minIndent);
  });
  
  return normalizedLines.join('\n');
};
