/**
 * SAST (Semantic Abstract Syntax Tree) Service
 * 
 * Service for interacting with the new SAST endpoints that provide semantic
 * primitive vocabulary, ambiguity resolution, cross-lingual support, and
 * evolution comparison between traditional Cortex and SAST approaches.
 */

import { apiClient } from "../config/api";

// ============================================================================
// SAST TYPE DEFINITIONS
// ============================================================================

export interface SemanticPrimitive {
    id: string;
    category: 'concept' | 'action' | 'property' | 'relation' | 'quantity' | 'time' | 'location' | 'modality' | 'logical' | 'discourse';
    baseForm: string;
    definition: string;
    synonyms: string[];
    translations: Record<string, string[]>;
    frequency: number;
    abstractness: number;
    relationships: SemanticRelationship[];
    created: string;
    lastUpdated: string;
}

export interface SemanticRelationship {
    type: 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'meronym' | 'holonym' | 'entailment' | 'causation' | 'association';
    targetId: string;
    strength: number;
    context?: string;
}

export interface SemanticVocabularyStats {
    totalPrimitives: number;
    primitivesByCategory: Record<string, number>;
    averageTranslations: number;
    coverageByLanguage: Record<string, number>;
    lastUpdated: string;
}

export interface SemanticSearchQuery {
    term?: string;
    category?: string;
    language?: string;
    limit?: number;
}

export interface SemanticSearchResult {
    primitive: SemanticPrimitive;
    relevanceScore: number;
    matchType: 'exact' | 'synonym' | 'translation' | 'relationship';
}

export interface CortexEvolutionComparison {
    inputText: string;
    language: string;
    traditionalCortex: {
        tokenCount: number;
        ambiguityLevel: 'high' | 'medium' | 'low';
        semanticExplicitness: number;
    };
    sastCortex: {
        primitiveCount: number;
        ambiguitiesResolved: number;
        semanticExplicitness: number;
    };
    improvements: {
        tokenReduction: number;
        ambiguityReduction: number;
        semanticClarityGain: number;
        crossLingualCompatibility: boolean;
        processingEfficiency: number;
    };
    metadata: {
        comparisonTime: number;
        complexityLevel: 'simple' | 'moderate' | 'complex';
        recommendedApproach: 'traditional' | 'sast' | 'hybrid';
    };
}

export interface SastShowcase {
    examples: CortexEvolutionComparison[];
    summary: {
        avgTokenReduction: number;
        avgAmbiguityReduction: number;
        avgSemanticGain: number;
        universalCompatibility: number;
    };
}

export interface UniversalSemanticTest {
    concept: string;
    languages: string[];
    translations: Record<string, string>;
    sastRepresentations: Record<string, any>;
    isUniversal: boolean;
    unificationScore: number;
}

export interface LanguageToPrimitiveMapping {
    language: string;
    sourceText: string;
    primitives: Array<{
        primitiveId: string;
        sourceSpan: [number, number];
        confidence: number;
        alternatives: Array<{
            primitiveId: string;
            confidence: number;
            reason: string;
        }>;
    }>;
    confidence: number;
    ambiguity: Array<{
        ambiguousSpan: [number, number];
        possibleInterpretations: Array<{
            interpretation: string;
            primitives: string[];
            likelihood: number;
        }>;
        chosenInterpretation: any;
        resolutionStrategy: string;
        confidence: number;
    }>;
}

export interface TelescopeDemo {
    telescopeDemo: {
        originalSentence: string;
        interpretations: Array<{
            semanticFrame: any;
            sourceMapping: LanguageToPrimitiveMapping;
            ambiguitiesResolved: any[];
            metadata: any;
        }>;
        comparison: string;
    };
    sastStats: {
        totalEncodings: number;
        successfulEncodings: number;
        ambiguitiesResolved: number;
        averageProcessingTime: number;
        semanticAccuracy: number;
    };
    explanation: {
        sentence: string;
        ambiguityType: string;
        interpretations: string[];
        resolution: string;
    };
}

export interface SastStats {
    encoding: {
        totalEncodings: number;
        successfulEncodings: number;
        ambiguitiesResolved: number;
        averageProcessingTime: number;
        semanticAccuracy: number;
    };
    comparison: {
        totalComparisons: number;
        sastWins: number;
        traditionalWins: number;
        averageImprovement: number;
        ambiguityResolutionRate: number;
        sastWinRate: number;
    };
    lastUpdated: string;
}

// ============================================================================
// SAST SERVICE CLASS
// ============================================================================

export class SastService {
    /**
     * Get SAST vocabulary statistics
     */
    async getVocabularyStats(): Promise<SemanticVocabularyStats> {
        try {
            const response = await apiClient.get('/optimizations/sast/vocabulary');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching SAST vocabulary stats:', error);
            throw error;
        }
    }

    /**
     * Search semantic primitives
     */
    async searchSemanticPrimitives(query: SemanticSearchQuery): Promise<{
        results: SemanticSearchResult[];
        totalFound: number;
        query: SemanticSearchQuery;
    }> {
        try {
            const response = await apiClient.post('/optimizations/sast/search', query);
            return response.data.data;
        } catch (error) {
            console.error('Error searching semantic primitives:', error);
            throw error;
        }
    }

    /**
     * Compare traditional Cortex vs SAST evolution
     */
    async compareEvolution(text: string, language: string = 'en'): Promise<CortexEvolutionComparison> {
        try {
            const response = await apiClient.post('/optimizations/sast/compare', { text, language });
            return response.data.data;
        } catch (error) {
            console.error('Error comparing SAST evolution:', error);
            throw error;
        }
    }

    /**
     * Get SAST showcase with multiple examples
     */
    async getSastShowcase(): Promise<SastShowcase> {
        try {
            const response = await apiClient.get('/optimizations/sast/showcase');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching SAST showcase:', error);
            throw error;
        }
    }

    /**
     * Test universal semantic representation
     */
    async testUniversalSemantics(concept: string, languages: string[] = ['en', 'es', 'fr']): Promise<UniversalSemanticTest> {
        try {
            const response = await apiClient.post('/optimizations/sast/universal-test', { concept, languages });
            return response.data.data;
        } catch (error) {
            console.error('Error testing universal semantics:', error);
            throw error;
        }
    }

    /**
     * Get telescope ambiguity demonstration
     */
    async getTelescopeDemo(): Promise<TelescopeDemo> {
        try {
            const response = await apiClient.get('/optimizations/sast/telescope-demo');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching telescope demo:', error);
            throw error;
        }
    }

    /**
     * Map natural language to semantic primitives
     */
    async mapSemanticPrimitives(text: string, language: string = 'en'): Promise<LanguageToPrimitiveMapping> {
        try {
            const response = await apiClient.post('/optimizations/sast/map-primitives', { text, language });
            return response.data.data;
        } catch (error) {
            console.error('Error mapping semantic primitives:', error);
            throw error;
        }
    }

    /**
     * Get SAST service statistics
     */
    async getSastStats(): Promise<SastStats> {
        try {
            const response = await apiClient.get('/optimizations/sast/stats');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching SAST stats:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const sastService = new SastService();
export default sastService;
