/**
 * Generates email content (subject and body) for contact emails
 * @param clickedElement - What the user clicked (e.g., "Talk to Us", "Contact", "Support")
 * @param interest - What they're interested in (e.g., "Pricing", "Enterprise Plan", "Support")
 * @returns Object with encoded subject and body
 */
function generateEmailContent(clickedElement: string, interest: string) {
  const email = 'support@costkatana.com';
  const subject = `Inquiry from ${clickedElement} - ${interest}`;
  const body =
    `Hello CostKatana Team,\n\n` +
    `I'm interested in learning more about CostKatana.\n\n` +
    `Contact Source: ${clickedElement}\n` +
    `Area of Interest: ${interest}\n\n` +
    `Please provide me with more information.\n\n` +
    `Best regards`;

  return {
    email,
    subject: encodeURIComponent(subject),
    body: encodeURIComponent(body),
  };
}

/**
 * Generates a Gmail compose link with pre-filled recipient, subject, and body
 * @param clickedElement - What the user clicked (e.g., "Talk to Us", "Contact", "Support")
 * @param interest - What they're interested in (e.g., "Pricing", "Enterprise Plan", "Support")
 * @returns Gmail compose URL with pre-filled email
 */
export function generateGmailComposeLink(
  clickedElement: string,
  interest: string
): string {
  const { email, subject, body } = generateEmailContent(clickedElement, interest);
  // Gmail compose URL format
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
}

/**
 * Generates a mailto link (universal, works with all email clients)
 * @param clickedElement - What the user clicked
 * @param interest - What they're interested in
 * @param customSubject - Optional custom subject line
 * @returns mailto link with pre-filled email
 */
export function generateMailtoLink(
  clickedElement: string,
  interest: string,
  customSubject?: string
): string {
  const { email, subject, body } = generateEmailContent(clickedElement, interest);
  const finalSubject = customSubject ? encodeURIComponent(customSubject) : subject;
  return `mailto:${email}?subject=${finalSubject}&body=${body}`;
}

/**
 * Smart contact link generator that defaults to Gmail for better user experience
 * @param clickedElement - What the user clicked
 * @param interest - What they're interested in
 * @param preferredClient - Preferred email client: 'gmail' or 'mailto' (default: 'gmail')
 * @param customSubject - Optional custom subject line (only used with mailto)
 * @returns Contact link (Gmail or mailto)
 */
export function getContactLink(
  clickedElement: string,
  interest: string,
  preferredClient: 'gmail' | 'mailto' = 'gmail',
  customSubject?: string
): string {
  if (preferredClient === 'mailto') {
    return generateMailtoLink(clickedElement, interest, customSubject);
  }
  
  // Default to Gmail for better user experience
  return generateGmailComposeLink(clickedElement, interest);
}

