import React, { useState, useEffect } from 'react';
import {
    FiStar,
    FiDownload,
    FiSearch,
    FiTrendingUp,
    FiCode,
    FiEdit3,
    FiBarChart,
    FiBriefcase,
    FiEye,
    FiHeart,
    FiZap,
    FiCheckCircle
} from 'react-icons/fi';
import { PromptTemplate } from '../../types/promptTemplate.types';

interface TemplateMarketplaceProps {
    onImportTemplate: (template: any) => void;
    onPreviewTemplate: (template: PromptTemplate) => void;
}

interface MarketplaceTemplate extends PromptTemplate {
    downloadCount: number;
    featured: boolean;
    author: {
        name: string;
        avatar?: string;
        verified: boolean;
    };
    preview: string;
    costSavings: {
        percentage: number;
        avgSaved: number;
    };
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
    onImportTemplate,
    onPreviewTemplate
}) => {
    const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'savings'>('popular');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const categories = [
        { id: 'all', name: 'All Templates', icon: <FiZap className="category-icon" />, count: 0 },
        { id: 'coding', name: 'Code & Development', icon: <FiCode className="category-icon" />, count: 0 },
        { id: 'writing', name: 'Content Writing', icon: <FiEdit3 className="category-icon" />, count: 0 },
        { id: 'analysis', name: 'Data Analysis', icon: <FiBarChart className="category-icon" />, count: 0 },
        { id: 'creative', name: 'Creative Content', icon: <FiArrowRight className="category-icon" />, count: 0 },
        { id: 'business', name: 'Business & Marketing', icon: <FiBriefcase className="category-icon" />, count: 0 }
    ];

    // Mock data for marketplace templates
    const mockTemplates: MarketplaceTemplate[] = [
        {
            _id: 'marketplace-1',
            name: 'API Documentation Generator',
            description: 'Generate comprehensive API documentation with examples and error handling',
            content: `Generate comprehensive API documentation for {{endpoint_name}}.

**Endpoint:** {{method}} {{endpoint_path}}
**Purpose:** {{purpose}}
**Parameters:**
{{parameters}}

**Response Format:**
{{response_format}}

Include:
- Clear description and use cases
- Request/response examples
- Authentication requirements
- Error codes and handling
- Rate limiting information
- SDK examples in {{language}}`,
            category: 'coding',
            createdBy: {
                _id: 'user1',
                name: 'TechWriter Pro',
                email: 'techwriter@example.com'
            },
            version: 1,
            variables: [
                { name: 'endpoint_name', description: 'API endpoint name', defaultValue: '', required: true, type: 'text' },
                { name: 'method', description: 'HTTP method', defaultValue: 'GET', required: true, type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
                { name: 'endpoint_path', description: 'API path', defaultValue: '', required: true, type: 'text' },
                { name: 'purpose', description: 'What the endpoint does', defaultValue: '', required: true, type: 'text' },
                { name: 'parameters', description: 'Endpoint parameters', defaultValue: '', required: true, type: 'text' },
                { name: 'response_format', description: 'Response structure', defaultValue: '', required: true, type: 'text' },
                { name: 'language', description: 'Programming language for examples', defaultValue: 'JavaScript', required: false, type: 'text' }
            ],
            metadata: {
                estimatedTokens: 420,
                estimatedCost: 0.012,
                recommendedModel: 'gpt-4',
                tags: ['api', 'documentation', 'development'],
                language: 'en'
            },
            usage: {
                count: 1247,
                lastUsed: new Date().toISOString(),
                totalTokensSaved: 45000,
                totalCostSaved: 890,
                averageRating: 4.8,
                feedback: []
            },
            sharing: {
                visibility: 'public',
                sharedWith: [],
                allowFork: true
            },
            isActive: true,
            isDeleted: false,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            downloadCount: 1247,
            featured: true,
            author: {
                name: 'TechWriter Pro',
                verified: true
            },
            preview: 'Perfect for creating professional API documentation that developers actually want to read.',
            costSavings: {
                percentage: 75,
                avgSaved: 4.50
            }
        },
        {
            _id: 'marketplace-2',
            name: 'Blog Post Generator',
            description: 'Create engaging, SEO-optimized blog posts with clear structure and CTAs',
            content: `Write a {{tone}} blog post about {{topic}} for {{target_audience}}.

**Target Length:** {{word_count}} words
**Primary Keyword:** {{primary_keyword}}
**Secondary Keywords:** {{secondary_keywords}}

**Content Structure:**
1. Hook and Introduction
2. {{main_points}}
3. Actionable insights and tips
4. Conclusion with {{cta_type}}

**Requirements:**
- {{tone}} tone throughout
- Include statistics and examples
- Optimize for SEO with natural keyword placement
- Use subheadings (H2, H3) for readability
- Include at least one compelling quote or insight
- End with a strong call-to-action

**SEO Guidelines:**
- Natural keyword density
- Meta description ready excerpt
- Internal linking opportunities
- Social media friendly format`,
            category: 'writing',
            createdBy: {
                _id: 'user2',
                name: 'Content Marketing Expert',
                email: 'content@example.com'
            },
            version: 1,
            variables: [
                { name: 'topic', description: 'Blog post topic', defaultValue: '', required: true, type: 'text' },
                { name: 'tone', description: 'Writing tone', defaultValue: 'professional', required: true, type: 'select', options: ['professional', 'casual', 'friendly', 'authoritative'] },
                { name: 'target_audience', description: 'Target readers', defaultValue: '', required: true, type: 'text' },
                { name: 'word_count', description: 'Target word count', defaultValue: '1000-1200', required: false, type: 'text' },
                { name: 'primary_keyword', description: 'Main SEO keyword', defaultValue: '', required: true, type: 'text' },
                { name: 'secondary_keywords', description: 'Additional keywords', defaultValue: '', required: false, type: 'text' },
                { name: 'main_points', description: 'Key points to cover', defaultValue: '', required: true, type: 'text' },
                { name: 'cta_type', description: 'Call-to-action type', defaultValue: 'newsletter signup', required: false, type: 'text' }
            ],
            metadata: {
                estimatedTokens: 520,
                estimatedCost: 0.015,
                recommendedModel: 'gpt-4',
                tags: ['blog', 'content', 'seo', 'marketing'],
                language: 'en'
            },
            usage: {
                count: 892,
                lastUsed: new Date().toISOString(),
                totalTokensSaved: 38000,
                totalCostSaved: 750,
                averageRating: 4.6,
                feedback: []
            },
            sharing: {
                visibility: 'public',
                sharedWith: [],
                allowFork: true
            },
            isActive: true,
            isDeleted: false,
            createdAt: '2024-01-10T14:30:00Z',
            updatedAt: '2024-01-10T14:30:00Z',
            downloadCount: 892,
            featured: true,
            author: {
                name: 'Content Marketing Expert',
                verified: true
            },
            preview: 'Generate high-quality, SEO-optimized blog content that drives traffic and engagement.',
            costSavings: {
                percentage: 68,
                avgSaved: 3.80
            }
        },
        {
            _id: 'marketplace-3',
            name: 'Data Analysis Report',
            description: 'Transform raw data into actionable business insights and recommendations',
            content: `Analyze the {{data_type}} dataset and provide comprehensive insights.

**Dataset Overview:**
- Data Source: {{data_source}}
- Time Period: {{time_period}}
- Sample Size: {{sample_size}}
- Key Metrics: {{key_metrics}}

**Analysis Objectives:**
{{analysis_objectives}}

**Analysis Requirements:**
1. **Executive Summary**
   - Key findings in 2-3 bullets
   - Business impact assessment
   - Recommended actions

2. **Detailed Analysis**
   - Trend identification and patterns
   - Statistical significance testing
   - Correlation analysis
   - Outlier investigation

3. **Insights & Recommendations**
   - Actionable business recommendations
   - Risk assessment
   - Implementation roadmap
   - Expected outcomes

4. **Visualization Suggestions**
   - Recommended chart types
   - Key metrics to highlight
   - Dashboard layout ideas

**Output Format:**
- Executive summary (200 words)
- Detailed findings with evidence
- Data-driven recommendations
- Next steps with priorities

Focus on {{business_context}} implications and provide specific, measurable recommendations.`,
            category: 'analysis',
            createdBy: {
                _id: 'user3',
                name: 'Data Analytics Pro',
                email: 'analytics@example.com'
            },
            version: 1,
            variables: [
                { name: 'data_type', description: 'Type of data being analyzed', defaultValue: '', required: true, type: 'text' },
                { name: 'data_source', description: 'Where the data comes from', defaultValue: '', required: true, type: 'text' },
                { name: 'time_period', description: 'Analysis time range', defaultValue: '', required: true, type: 'text' },
                { name: 'sample_size', description: 'Number of data points', defaultValue: '', required: false, type: 'text' },
                { name: 'key_metrics', description: 'Primary metrics to analyze', defaultValue: '', required: true, type: 'text' },
                { name: 'analysis_objectives', description: 'What you want to discover', defaultValue: '', required: true, type: 'text' },
                { name: 'business_context', description: 'Business context and goals', defaultValue: '', required: true, type: 'text' }
            ],
            metadata: {
                estimatedTokens: 450,
                estimatedCost: 0.013,
                recommendedModel: 'gpt-4',
                tags: ['analytics', 'data', 'business', 'insights'],
                language: 'en'
            },
            usage: {
                count: 634,
                lastUsed: new Date().toISOString(),
                totalTokensSaved: 28000,
                totalCostSaved: 620,
                averageRating: 4.7,
                feedback: []
            },
            sharing: {
                visibility: 'public',
                sharedWith: [],
                allowFork: true
            },
            isActive: true,
            isDeleted: false,
            createdAt: '2024-01-08T09:15:00Z',
            updatedAt: '2024-01-08T09:15:00Z',
            downloadCount: 634,
            featured: false,
            author: {
                name: 'Data Analytics Pro',
                verified: true
            },
            preview: 'Turn complex datasets into clear, actionable business intelligence reports.',
            costSavings: {
                percentage: 72,
                avgSaved: 4.20
            }
        }
    ];

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            // In real implementation, this would fetch from API
            // For now, use mock data
            setTemplates(mockTemplates);

            // Update category counts
            categories.forEach(category => {
                if (category.id === 'all') {
                    category.count = mockTemplates.length;
                } else {
                    category.count = mockTemplates.filter(t => t.category === category.id).length;
                }
            });
        } catch (error) {
            console.error('Error loading marketplace templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchQuery ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.metadata.tags.some(tag =>
                tag.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        switch (sortBy) {
            case 'popular':
                return b.downloadCount - a.downloadCount;
            case 'rating':
                return (b.usage.averageRating || 0) - (a.usage.averageRating || 0);
            case 'recent':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'savings':
                return b.costSavings.percentage - a.costSavings.percentage;
            default:
                return 0;
        }
    });

    const handleImport = async (template: MarketplaceTemplate) => {
        try {
            // Convert marketplace template to create template format
            const templateData = {
                name: `${template.name} (Copy)`,
                description: template.description,
                content: template.content,
                category: template.category,
                variables: template.variables,
                metadata: {
                    tags: [...template.metadata.tags, 'marketplace'],
                    estimatedTokens: template.metadata.estimatedTokens
                }
            };

            await onImportTemplate(templateData);
        } catch (error) {
            console.error('Error importing template:', error);
        }
    };

    const toggleFavorite = (templateId: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(templateId)) {
                newFavorites.delete(templateId);
            } else {
                newFavorites.add(templateId);
            }
            return newFavorites;
        });
    };

    return (
        <div className="template-marketplace">
            <style>{`
                .template-marketplace {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .marketplace-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .marketplace-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 1rem;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .marketplace-subtitle {
                    font-size: 1.2rem;
                    color: #6b7280;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .filters-section {
                    background: white;
                    border-radius: 15px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    margin-bottom: 2rem;
                    border: 1px solid #f3f4f6;
                }

                .search-bar {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .search-input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    border: 1px solid #d1d5db;
                    border-radius: 50px;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6b7280;
                }

                .filter-row {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .filter-label {
                    font-weight: 500;
                    color: #374151;
                    white-space: nowrap;
                }

                .filter-select {
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    color: #374151;
                    cursor: pointer;
                    transition: border-color 0.2s ease;
                }

                .filter-select:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .category-card {
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .category-card:hover {
                    border-color: #667eea;
                    transform: translateY(-2px);
                }

                .category-card.active {
                    border-color: #667eea;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }

                .category-icon {
                    width: 24px;
                    height: 24px;
                    margin: 0 auto 0.5rem;
                    display: block;
                }

                .category-name {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .category-count {
                    font-size: 0.8rem;
                    opacity: 0.7;
                }

                .templates-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 2rem;
                }

                .template-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    border: 1px solid #f3f4f6;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .template-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
                }

                .template-card.featured {
                    border-color: #fbbf24;
                    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                }

                .featured-badge {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: linear-gradient(45deg, #f59e0b, #d97706);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .template-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 1.5rem;
                }

                .template-info {
                    flex: 1;
                }

                .template-name {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                    line-height: 1.3;
                }

                .template-author {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }

                .verified-badge {
                    color: #10b981;
                    font-size: 0.8rem;
                }

                .template-rating {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .rating-stars {
                    color: #f59e0b;
                    display: flex;
                    gap: 0.1rem;
                }

                .rating-count {
                    color: #6b7280;
                }

                .template-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .action-btn {
                    padding: 0.5rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .favorite-btn {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .favorite-btn.active {
                    background: #fef2f2;
                    color: #ef4444;
                }

                .preview-btn {
                    background: #eff6ff;
                    color: #2563eb;
                }

                .template-description {
                    color: #6b7280;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .template-preview {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 1rem;
                    font-style: italic;
                    color: #475569;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }

                .template-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .stat-item {
                    text-align: center;
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .stat-value {
                    font-weight: 700;
                    color: #1f2937;
                    font-size: 1.1rem;
                    display: block;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                }

                .template-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                .tag {
                    background: #e0e7ff;
                    color: #3730a3;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .cost-savings {
                    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                    border: 1px solid #6ee7b7;
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                }

                .savings-title {
                    font-weight: 600;
                    color: #065f46;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .savings-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .savings-item {
                    text-align: center;
                }

                .savings-value {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #047857;
                    display: block;
                }

                .savings-label {
                    font-size: 0.8rem;
                    color: #065f46;
                }

                .template-footer {
                    display: flex;
                    gap: 1rem;
                }

                .btn {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                .loading-state {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 200px;
                    color: #6b7280;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #6b7280;
                }

                .empty-icon {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 1rem;
                    color: #d1d5db;
                }

                @media (max-width: 768px) {
                    .template-marketplace {
                        padding: 1rem;
                    }
                    
                    .categories-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .templates-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .filter-row {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .template-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .savings-stats {
                        grid-template-columns: 1fr;
                    }
                    
                    .template-footer {
                        flex-direction: column;
                    }
                }
            `}</style>

            <div className="marketplace-header">
                <h1 className="marketplace-title">Template Marketplace</h1>
                <p className="marketplace-subtitle">
                    Discover professionally crafted templates created by our community.
                    Save time and money with proven, high-quality prompts.
                </p>
            </div>

            <div className="filters-section">
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search templates by name, description, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <span className="filter-label">Sort by:</span>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="recent">Recently Added</option>
                            <option value="savings">Best Savings</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="categories-grid">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        {category.icon}
                        <div className="category-name">{category.name}</div>
                        <div className="category-count">{category.count} templates</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div>Loading templates...</div>
                </div>
            ) : sortedTemplates.length === 0 ? (
                <div className="empty-state">
                    <FiSearch className="empty-icon" />
                    <h3>No templates found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="templates-grid">
                    {sortedTemplates.map((template) => (
                        <div
                            key={template._id}
                            className={`template-card ${template.featured ? 'featured' : ''}`}
                        >
                            {template.featured && (
                                <div className="featured-badge">Featured</div>
                            )}

                            <div className="template-header">
                                <div className="template-info">
                                    <h3 className="template-name">{template.name}</h3>
                                    <div className="template-author">
                                        <span>by {template.author.name}</span>
                                        {template.author.verified && (
                                            <FiCheckCircle className="verified-badge" />
                                        )}
                                    </div>
                                    <div className="template-rating">
                                        <div className="rating-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    style={{
                                                        fill: i < Math.floor(template.usage.averageRating || 0) ? 'currentColor' : 'none'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span className="rating-count">
                                            {template.usage.averageRating?.toFixed(1)} ({template.downloadCount})
                                        </span>
                                    </div>
                                </div>

                                <div className="template-actions">
                                    <button
                                        className={`action-btn favorite-btn ${favorites.has(template._id) ? 'active' : ''}`}
                                        onClick={() => toggleFavorite(template._id)}
                                    >
                                        <FiHeart />
                                    </button>
                                    <button
                                        className="action-btn preview-btn"
                                        onClick={() => onPreviewTemplate(template)}
                                    >
                                        <FiEye />
                                    </button>
                                </div>
                            </div>

                            <p className="template-description">{template.description}</p>

                            <div className="template-preview">
                                "{template.preview}"
                            </div>

                            <div className="template-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{template.downloadCount}</span>
                                    <div className="stat-label">Downloads</div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{template.variables.length}</span>
                                    <div className="stat-label">Variables</div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">~{template.metadata.estimatedTokens}</span>
                                    <div className="stat-label">Tokens</div>
                                </div>
                            </div>

                            <div className="template-tags">
                                {template.metadata.tags.map((tag) => (
                                    <span key={tag} className="tag">#{tag}</span>
                                ))}
                            </div>

                            <div className="cost-savings">
                                <div className="savings-title">
                                    <FiTrendingUp />
                                    Cost Savings
                                </div>
                                <div className="savings-stats">
                                    <div className="savings-item">
                                        <span className="savings-value">{template.costSavings.percentage}%</span>
                                        <div className="savings-label">Less Cost</div>
                                    </div>
                                    <div className="savings-item">
                                        <span className="savings-value">${template.costSavings.avgSaved}</span>
                                        <div className="savings-label">Avg Saved</div>
                                    </div>
                                </div>
                            </div>

                            <div className="template-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => onPreviewTemplate(template)}
                                >
                                    <FiEye />
                                    Preview
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleImport(template)}
                                >
                                    <FiDownload />
                                    Import Template
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 