/**
 * Threat Detection Service (Frontend)
 * Lightweight client-side detection for all 15 threat categories
 * Blocks messages before sending to backend
 */

import { apiClient } from '../config/api';

export interface ThreatDetectionResult {
  isBlocked: boolean;
  threatCategory?: string;
  reason: string;
  confidence: number;
}

export interface ThreatCategory {
  value: string;
  label: string;
}

class ThreatDetectionService {
  // Pre-compiled regex patterns for fast client-side detection
  private static readonly INJECTION_PATTERNS = [
    /ignore\s+(?:all\s+)?(?:previous\s+)?(?:system\s+)?instructions?/i,
    /forget\s+(?:all\s+)?(?:previous\s+)?(?:system\s+)?instructions?/i,
    /disregard\s+(?:all\s+)?(?:previous\s+)?(?:system\s+)?instructions?/i,
    /override\s+(?:all\s+)?(?:previous\s+)?(?:system\s+)?instructions?/i,
    /you\s+are\s+now\s+(?:a\s+)?(?:different\s+)?(?:character|person|ai)/i,
    /pretend\s+(?:to\s+be|you\s+are)/i,
    /roleplay\s+as/i,
    /act\s+as\s+(?:if\s+you\s+are\s+)?(?:a\s+)?(?:different\s+)?(?:character|person)/i,
    /bypass\s+(?:your\s+)?(?:safety\s+)?(?:guidelines|restrictions|filters)/i,
    /jailbreak/i,
  ];

  private static readonly JAILBREAK_PATTERNS = [
    /dan\s+mode/i,
    /developer\s+mode/i,
    /god\s+mode/i,
    /unrestricted\s+mode/i,
    /evil\s+mode/i,
    /opposite\s+mode/i,
    /reverse\s+mode/i,
    /simulate\s+(?:a\s+)?(?:jailbroken|unrestricted)/i,
    /hypothetically/i,
    /in\s+a\s+fictional\s+world/i,
    /for\s+educational\s+purposes/i,
    /academic\s+research/i
  ];

  private static readonly VIOLENCE_HATE_PATTERNS = [
    /violence\s+against/i,
    /hate\s+speech/i,
    /kill\s+(?:all|everyone|them)/i,
    /terrorist/i,
    /bomb\s+(?:making|building|creating)/i,
    /attack\s+(?:on|against)/i,
    /genocide/i,
    /ethnic\s+cleansing/i
  ];

  private static readonly SEXUAL_CONTENT_PATTERNS = [
    /explicit\s+sexual/i,
    /pornographic/i,
    /sexual\s+content/i,
    /nsfw/i
  ];

  private static readonly SELF_HARM_PATTERNS = [
    /suicide\s+methods/i,
    /self\s+harm/i,
    /how\s+to\s+kill\s+myself/i,
    /end\s+my\s+life/i
  ];

  private static readonly PRIVACY_VIOLATION_PATTERNS = [
    /extract\s+(?:all\s+)?(?:personal|private|sensitive)\s+(?:data|information)/i,
    /show\s+me\s+(?:all\s+)?(?:passwords|credentials|secrets)/i,
    /dump\s+(?:all\s+)?(?:user|customer)\s+(?:data|information)/i,
    /expose\s+(?:all\s+)?(?:private|confidential)/i
  ];

  private static readonly CRIMINAL_PLANNING_PATTERNS = [
    /how\s+to\s+(?:hack|break\s+into|steal|rob)/i,
    /plan\s+(?:a\s+)?(?:crime|criminal|illegal)/i,
    /illegal\s+(?:activities|actions|methods)/i
  ];

  private static readonly WEAPONS_PATTERNS = [
    /guns?\s+and\s+illegal\s+weapons/i,
    /how\s+to\s+(?:make|build|create)\s+(?:a\s+)?(?:gun|weapon|bomb)/i,
    /illegal\s+weapons/i
  ];

  private static readonly SUBSTANCES_PATTERNS = [
    /illegal\s+drugs/i,
    /regulated\s+substances/i,
    /how\s+to\s+(?:make|produce|synthesize)\s+(?:drugs?|substances?)/i
  ];

  private static readonly DATA_EXFILTRATION_PATTERNS = [
    /data\s+exfiltration/i,
    /extract\s+(?:all\s+)?(?:data|information|files)/i,
    /download\s+(?:all\s+)?(?:database|data)/i,
    /export\s+(?:all\s+)?(?:sensitive|confidential)/i
  ];

  private static readonly PHISHING_PATTERNS = [
    /phishing/i,
    /social\s+engineering/i,
    /scam\s+(?:email|message|link)/i,
    /fake\s+(?:website|login|page)/i
  ];

  private static readonly SPAM_PATTERNS = [
    /spam\s+and\s+unwanted\s+content/i,
    /unsolicited\s+(?:email|message|content)/i,
    /bulk\s+(?:email|message)/i
  ];

  private static readonly MISINFORMATION_PATTERNS = [
    /misinformation/i,
    /false\s+information/i,
    /fake\s+news/i,
    /disinformation/i
  ];

  private static readonly IP_VIOLATION_PATTERNS = [
    /intellectual\s+property\s+violations/i,
    /copyright\s+infringement/i,
    /pirated\s+(?:content|software|media)/i,
    /unauthorized\s+(?:copy|distribution)/i
  ];

  private static readonly HARASSMENT_PATTERNS = [
    /harassment\s+and\s+bullying/i,
    /cyberbullying/i,
    /threaten\s+(?:to\s+)?(?:harm|hurt)/i,
    /intimidate/i
  ];

  /**
   * Get all threat categories
   */
  static getThreatCategories(): ThreatCategory[] {
    return [
      { value: 'violence_and_hate', label: 'Violence & Hate' },
      { value: 'sexual_content', label: 'Sexual Content' },
      { value: 'self_harm', label: 'Self Harm' },
      { value: 'prompt_injection', label: 'Prompt Injection' },
      { value: 'jailbreak_attempt', label: 'Jailbreak Attempt' },
      { value: 'privacy_violations', label: 'Privacy Violations' },
      { value: 'harmful_content', label: 'Harmful Content' },
      { value: 'criminal_planning', label: 'Criminal Planning' },
      { value: 'guns_and_illegal_weapons', label: 'Guns & Illegal Weapons' },
      { value: 'regulated_substances', label: 'Regulated Substances' },
      { value: 'data_exfiltration', label: 'Data Exfiltration' },
      { value: 'phishing_and_social_engineering', label: 'Phishing & Social Engineering' },
      { value: 'spam_and_unwanted_content', label: 'Spam & Unwanted Content' },
      { value: 'misinformation', label: 'Misinformation' },
      { value: 'intellectual_property_violations', label: 'IP Violations' },
      { value: 'harassment_and_bullying', label: 'Harassment & Bullying' },
    ];
  }

  /**
   * Check content for threats using pattern matching (fast client-side check)
   */
  static checkContent(content: string): ThreatDetectionResult {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return {
        isBlocked: false,
        reason: 'Empty content',
        confidence: 0.0
      };
    }


    // Check each threat category
    const checks = [
      { patterns: this.INJECTION_PATTERNS, category: 'prompt_injection' },
      { patterns: this.JAILBREAK_PATTERNS, category: 'jailbreak_attempt' },
      { patterns: this.VIOLENCE_HATE_PATTERNS, category: 'violence_and_hate' },
      { patterns: this.SEXUAL_CONTENT_PATTERNS, category: 'sexual_content' },
      { patterns: this.SELF_HARM_PATTERNS, category: 'self_harm' },
      { patterns: this.PRIVACY_VIOLATION_PATTERNS, category: 'privacy_violations' },
      { patterns: this.CRIMINAL_PLANNING_PATTERNS, category: 'criminal_planning' },
      { patterns: this.WEAPONS_PATTERNS, category: 'guns_and_illegal_weapons' },
      { patterns: this.SUBSTANCES_PATTERNS, category: 'regulated_substances' },
      { patterns: this.DATA_EXFILTRATION_PATTERNS, category: 'data_exfiltration' },
      { patterns: this.PHISHING_PATTERNS, category: 'phishing_and_social_engineering' },
      { patterns: this.SPAM_PATTERNS, category: 'spam_and_unwanted_content' },
      { patterns: this.MISINFORMATION_PATTERNS, category: 'misinformation' },
      { patterns: this.IP_VIOLATION_PATTERNS, category: 'intellectual_property_violations' },
      { patterns: this.HARASSMENT_PATTERNS, category: 'harassment_and_bullying' },
    ];

    for (const check of checks) {
      for (const pattern of check.patterns) {
        if (pattern.test(content)) {
          return {
            isBlocked: true,
            threatCategory: check.category,
            reason: `Content detected as ${this.getThreatCategoryLabel(check.category)}`,
            confidence: 0.8 // High confidence for pattern matches
          };
        }
      }
    }

    return {
      isBlocked: false,
      reason: 'No threats detected',
      confidence: 0.0
    };
  }

  /**
   * Validate content with backend AI-based detection (optional, for complex cases)
   */
  static async validateWithBackend(content: string): Promise<ThreatDetectionResult> {
    try {
      const response = await apiClient.post('/moderation/check', {
        content
      });

      return {
        isBlocked: response.data.isBlocked || false,
        threatCategory: response.data.threatCategory,
        reason: response.data.reason || 'Backend validation completed',
        confidence: response.data.confidence || 0.0
      };
    } catch (error: any) {
      // If backend validation fails, fall back to client-side check
      console.warn('Backend threat validation failed, using client-side check', error);
      return this.checkContent(content);
    }
  }

  /**
   * Get user-friendly label for threat category
   */
  private static getThreatCategoryLabel(category: string): string {
    const categories = this.getThreatCategories();
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get user-friendly error message for blocked content
   */
  static getErrorMessage(result: ThreatDetectionResult): string {
    if (!result.isBlocked) {
      return '';
    }

    const categoryLabel = result.threatCategory 
      ? this.getThreatCategoryLabel(result.threatCategory)
      : 'inappropriate content';

    return `Your message was blocked because it contains ${categoryLabel.toLowerCase()}. Please revise your message and try again.`;
  }
}

export const threatDetectionService = new ThreatDetectionService();
export default ThreatDetectionService;

