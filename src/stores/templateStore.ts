import { create } from 'zustand';
import { PromptTemplate, TemplateVariable } from '../types/promptTemplate.types';
import { PromptTemplateService } from '../services/promptTemplate.service';

interface TemplateState {
    // Templates
    templates: PromptTemplate[];
    popularTemplates: PromptTemplate[];
    recentTemplates: PromptTemplate[];
    
    // Selected template for chat
    selectedTemplate: PromptTemplate | null;
    templateVariables: Record<string, any>;
    
    // UI state
    isTemplatePickerOpen: boolean;
    isLoading: boolean;
    error: string | null;
    
    // Search and filters
    searchQuery: string;
    selectedCategory: string | null;
    
    // Actions
    fetchTemplates: () => Promise<void>;
    fetchPopularTemplates: () => Promise<void>;
    selectTemplate: (template: PromptTemplate) => void;
    clearTemplate: () => void;
    setTemplateVariable: (name: string, value: any) => void;
    setTemplateVariables: (variables: Record<string, any>) => void;
    openTemplatePicker: () => void;
    closeTemplatePicker: () => void;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string | null) => void;
    addToRecentTemplates: (template: PromptTemplate) => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
    // Initial state
    templates: [],
    popularTemplates: [],
    recentTemplates: [],
    selectedTemplate: null,
    templateVariables: {},
    isTemplatePickerOpen: false,
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,

    // Fetch all accessible templates
    fetchTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
            const templates = await PromptTemplateService.getTemplates({
                page: 1,
                limit: 100
            });
            set({ 
                templates, 
                isLoading: false 
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch templates',
                isLoading: false 
            });
        }
    },

    // Fetch popular templates
    fetchPopularTemplates: async () => {
        try {
            const popularTemplates = await PromptTemplateService.getTrendingTemplates('week');
            set({ popularTemplates });
        } catch (error) {
            console.error('Failed to fetch popular templates:', error);
        }
    },

    // Select a template for use
    selectTemplate: (template: PromptTemplate) => {
        // Initialize variables with default values
        const initialVariables: Record<string, any> = {};
        template.variables.forEach((variable: TemplateVariable) => {
            if (variable.defaultValue) {
                initialVariables[variable.name] = variable.defaultValue;
            }
        });

        set({ 
            selectedTemplate: template,
            templateVariables: initialVariables
        });

        // Add to recent templates
        get().addToRecentTemplates(template);
    },

    // Clear selected template
    clearTemplate: () => {
        set({ 
            selectedTemplate: null,
            templateVariables: {}
        });
    },

    // Set a single template variable
    setTemplateVariable: (name: string, value: any) => {
        set((state) => ({
            templateVariables: {
                ...state.templateVariables,
                [name]: value
            }
        }));
    },

    // Set multiple template variables at once
    setTemplateVariables: (variables: Record<string, any>) => {
        set({ templateVariables: variables });
    },

    // Open template picker modal
    openTemplatePicker: () => {
        set({ isTemplatePickerOpen: true });
        
        // Fetch templates if not already loaded
        const { templates } = get();
        if (templates.length === 0) {
            get().fetchTemplates();
        }
        
        // Fetch popular templates
        get().fetchPopularTemplates();
    },

    // Close template picker modal
    closeTemplatePicker: () => {
        set({ isTemplatePickerOpen: false });
    },

    // Set search query
    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    // Set selected category filter
    setSelectedCategory: (category: string | null) => {
        set({ selectedCategory: category });
    },

    // Add template to recent templates
    addToRecentTemplates: (template: PromptTemplate) => {
        set((state) => {
            const filtered = state.recentTemplates.filter(t => t._id !== template._id);
            return {
                recentTemplates: [template, ...filtered].slice(0, 5) // Keep last 5
            };
        });
    }
}));

