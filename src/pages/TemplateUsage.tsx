import React from 'react';
import { TemplateUsage as TemplateUsageComponent } from '../components/templates';
import { useNotification } from '../contexts/NotificationContext';
import { PromptTemplate } from '../types/promptTemplate.types';

const TemplateUsagePage: React.FC = () => {
    const { showNotification } = useNotification();

    const handleTemplateUsed = (
        template: PromptTemplate, 
        variables: Record<string, string>, 
        generatedPrompt: string
    ) => {
        showNotification(
            `Template "${template.name}" used successfully! Prompt is ready to use.`,
            'success'
        );
        
        // Here you could also:
        // - Send to AI provider directly
        // - Save to clipboard
        // - Track analytics
        // - Show integration options
        console.log('Template used:', { template, variables, generatedPrompt });
    };

    return (
        <div className="template-usage-page">
            <TemplateUsageComponent onTemplateUsed={handleTemplateUsed} />
        </div>
    );
};

export default TemplateUsagePage; 