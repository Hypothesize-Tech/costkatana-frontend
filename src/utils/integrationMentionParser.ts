/**
 * Integration Mention Parser
 * Parses @mention syntax from chat messages and extracts structured data
 * 
 * Syntax: @integration:entity:subentity
 * Examples:
 * - @jira:project:PROJ-123
 * - @linear:team:ENG:issues
 * - @slack:channel:general
 * - @discord:channel:announcements
 */

export interface ParsedMention {
  integration: string;
  entityType?: string;
  entityId?: string;
  subEntityType?: string;
  subEntityId?: string;
  fullText: string;
  startIndex: number;
  endIndex: number;
}

export interface MentionMatch {
  mention: ParsedMention;
  remainingText: string;
}

/**
 * Valid integration types
 */
export const VALID_INTEGRATIONS = [
  'jira',
  'linear',
  'slack',
  'discord',
  'github',
  'vercel',
  'google',
  'drive',
  'sheets',
  'docs',
  'slides',
  'forms',
  'webhook',
  'aws',
  'mongodb'
] as const;

export type IntegrationMentionType = typeof VALID_INTEGRATIONS[number];

/**
 * Parse a single mention from text
 * @param text - The text containing the mention
 * @param startIndex - The index where the mention starts (after @)
 * @returns ParsedMention or null if invalid
 */
export function parseMention(text: string, startIndex: number): ParsedMention | null {
  // Find the end of the mention (space, newline, or end of string)
  let endIndex = startIndex;
  while (endIndex < text.length && text[endIndex] !== ' ' && text[endIndex] !== '\n' && text[endIndex] !== '\r') {
    endIndex++;
  }
  
  const mentionText = text.substring(startIndex, endIndex);
  
  // Pattern: @integration:entity:entityId or @integration:entity:entityId:subentity:subEntityId
  const mentionPattern = /^@([a-z]+)(?::([a-z]+):([a-zA-Z0-9_-]+))?(?::([a-z]+):([a-zA-Z0-9_-]+))?$/;
  const match = mentionText.match(mentionPattern);
  
  if (!match) {
    return null;
  }
  
  const [, integration, entityType, entityId, subEntityType, subEntityId] = match;
  
  // Validate integration type
  if (!VALID_INTEGRATIONS.includes(integration as IntegrationMentionType)) {
    return null;
  }
  
  return {
    integration,
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    subEntityType: subEntityType || undefined,
    subEntityId: subEntityId || undefined,
    fullText: mentionText,
    startIndex: startIndex - 1, // Include the @ symbol
    endIndex
  };
}

/**
 * Find all mentions in a text string
 * @param text - The text to search for mentions
 * @returns Array of ParsedMention objects
 */
export function findAllMentions(text: string): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  let index = 0;
  
  while (index < text.length) {
    if (text[index] === '@') {
      const mention = parseMention(text, index + 1);
      if (mention) {
        mentions.push(mention);
        index = mention.endIndex;
      } else {
        index++;
      }
    } else {
      index++;
    }
  }
  
  return mentions;
}

/**
 * Extract and remove mentions from text, returning the cleaned text and mentions
 * @param text - The text containing mentions
 * @returns Object with cleaned text and array of mentions
 */
export function extractMentions(text: string): MentionMatch {
  const mentions = findAllMentions(text);
  let cleanedText = text;
  
  // Remove mentions from text (in reverse order to preserve indices)
  for (let i = mentions.length - 1; i >= 0; i--) {
    const mention = mentions[i];
    cleanedText = 
      cleanedText.substring(0, mention.startIndex) + 
      cleanedText.substring(mention.endIndex);
  }
  
  return {
    mention: mentions[0] || null as any, // Return first mention for now
    remainingText: cleanedText.trim()
  };
}

/**
 * Validate mention format
 * @param mentionText - The mention text to validate (with or without @)
 * @returns true if valid, false otherwise
 */
export function validateMention(mentionText: string): boolean {
  const text = mentionText.startsWith('@') ? mentionText.substring(1) : mentionText;
  const mention = parseMention(`@${text}`, 0);
  return mention !== null;
}

/**
 * Format mention for display
 * @param mention - The parsed mention
 * @returns Formatted string for display
 */
export function formatMention(mention: ParsedMention): string {
  let formatted = `@${mention.integration}`;
  
  if (mention.entityType && mention.entityId) {
    formatted += `:${mention.entityType}:${mention.entityId}`;
  }
  
  if (mention.subEntityType && mention.subEntityId) {
    formatted += `:${mention.subEntityType}:${mention.subEntityId}`;
  }
  
  return formatted;
}

/**
 * Convert mention to backend payload format
 * @param mention - The parsed mention
 * @returns Structured data for backend
 */
export function mentionToPayload(mention: ParsedMention): {
  integration: string;
  entityType?: string;
  entityId?: string;
  subEntityType?: string;
  subEntityId?: string;
} {
  return {
    integration: mention.integration,
    entityType: mention.entityType,
    entityId: mention.entityId,
    subEntityType: mention.subEntityType,
    subEntityId: mention.subEntityId
  };
}

