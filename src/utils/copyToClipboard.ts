/**
 * Utility for copying text to clipboard
 */

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * Copy code from a code block
 * This function is exposed to the window object for use in HTML
 */
export const setupCopyCodeFunction = (): void => {
  // Add the copyCode function to the window object
  (window as any).copyCode = (button: HTMLButtonElement) => {
    // Find the code element
    const codeBlock = button.closest('.code-block-wrapper')?.querySelector('code');
    
    if (codeBlock) {
      // Get the text content
      const codeText = codeBlock.textContent || '';
      
      // Copy to clipboard
      copyToClipboard(codeText)
        .then(success => {
          if (success) {
            // Update button text temporarily
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.backgroundColor = '#4caf50';
            
            // Reset button after 2 seconds
            setTimeout(() => {
              button.textContent = originalText;
              button.style.backgroundColor = '';
            }, 2000);
          }
        });
    }
  };
};
