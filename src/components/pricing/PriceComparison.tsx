import React, { useState, useEffect, useRef } from 'react';
import { pricingService, ProviderPricing, PricingComparison } from '../../services/pricing.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './PriceComparison.css';

export const PriceComparison: React.FC = () => {
    const [allPricing, setAllPricing] = useState<ProviderPricing[]>([]);
    const [comparison, setComparison] = useState<PricingComparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [comparing, setComparing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state for comparison
    const [task, setTask] = useState('Generate a 500-word article');
    const [estimatedTokens, setEstimatedTokens] = useState(1000);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'cost' | 'provider' | 'model'>('cost');

    // UI state
    const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());

    const fallbackTimerRef = useRef<number | null>(null);
    const componentMountedRef = useRef(true);

    useEffect(() => {
        componentMountedRef.current = true;

        // Start with initial data load
        loadInitialData();

        // Set up fallback timer (reload data every 5 minutes)
        fallbackTimerRef.current = setInterval(() => {
            if (componentMountedRef.current) {
                loadInitialData();
            }
        }, 300000); // 5 minutes

        return () => {
            componentMountedRef.current = false;
            if (fallbackTimerRef.current) {
                clearInterval(fallbackTimerRef.current);
            }
        };
    }, []);

    const loadInitialData = async () => {
        try {
            console.log('📊 Loading initial pricing data...');
            const result = await pricingService.getAllPricing();
            console.log('📊 API result:', result);

            if (result.success && result.data && componentMountedRef.current) {
                console.log('✅ Setting pricing data:', result.data.pricing.length, 'providers');
                setAllPricing(result.data.pricing);
                setLastUpdate(new Date(result.data.lastUpdate));
                setLoading(false);
                setRefreshing(false);
                setError(null);
            } else if (componentMountedRef.current) {
                console.error('❌ API call failed:', result.error);
                setError(result.error || 'Failed to load pricing data');
                setLoading(false);
                setRefreshing(false);
            }
        } catch (error) {
            console.error('❌ Exception in loadInitialData:', error);
            if (componentMountedRef.current) {
                setError('Failed to load pricing data');
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    const handleComparePrice = async () => {
        if (!task || estimatedTokens <= 0) {
            setError('Please enter a task description and valid token count');
            return;
        }

        setComparing(true);
        setError(null);

        try {
            const result = await pricingService.comparePricing(task, estimatedTokens);
            if (result.success && result.data) {
                console.log('Comparison data received:', result.data);
                setComparison(result.data);
            } else {
                setError(result.error || 'Failed to compare prices');
            }
        } catch (error) {
            console.error('Error comparing prices:', error);
            setError('Failed to compare prices');
        } finally {
            setComparing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setError(null);
        await loadInitialData();
    };

    const getFilteredModels = () => {
        return allPricing.flatMap(provider =>
            provider.models
                .filter(model =>
                    selectedCategory === 'all' || model.category === selectedCategory
                )
                .map(model => ({ ...model, provider: provider.provider }))
        );
    };

    const getSortedComparison = () => {
        if (!comparison) return [];

        return [...comparison.providers].sort((a, b) => {
            switch (sortBy) {
                case 'cost':
                    return a.estimatedCost - b.estimatedCost;
                case 'provider':
                    return a.provider.localeCompare(b.provider);
                case 'model':
                    return a.model.localeCompare(b.model);
                default:
                    return 0;
            }
        });
    };

    const formatPrice = (price: number) => {
        if (price === 0 || price === null || price === undefined) {
            return '$0.000';
        }

        if (price >= 1) {
            return `$${price.toFixed(3)}`;
        } else if (price >= 0.001) {
            return `$${price.toFixed(3)}`;
        } else if (price >= 0.0001) {
            return `$${price.toFixed(4)}`;
        } else {
            // For very small values, show in scientific notation or micro-dollars
            return `$${(price * 1000000).toFixed(1)}μ`;
        }
    };

    const formatModelPrice = (pricePerMToken: number | null) => {
        if (pricePerMToken === null || pricePerMToken === undefined) {
            return 'N/A';
        }

        // Price is per million tokens, convert appropriately
        if (pricePerMToken >= 1000) {
            // Very expensive models - show per K tokens
            return `$${(pricePerMToken / 1000).toFixed(2)}/K`;
        } else if (pricePerMToken >= 1) {
            // Regular pricing - show per million tokens
            return `$${pricePerMToken.toFixed(2)}/M`;
        } else if (pricePerMToken >= 0.001) {
            // Low pricing - show per million tokens with more decimals
            return `$${pricePerMToken.toFixed(3)}/M`;
        } else {
            // Very low pricing - show per K tokens
            return `$${(pricePerMToken * 1000).toFixed(3)}/K`;
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            text: 'blue',
            multimodal: 'purple',
            embedding: 'green',
            code: 'orange'
        };
        return colors[category as keyof typeof colors] || 'gray';
    };

    const toggleProviderExpansion = (provider: string) => {
        const newExpanded = new Set(expandedProviders);
        if (newExpanded.has(provider)) {
            newExpanded.delete(provider);
        } else {
            newExpanded.add(provider);
        }
        setExpandedProviders(newExpanded);
    };

    if (loading) {
        return (
            <div className="price-comparison">
                <div className="loading-container">
                    <LoadingSpinner />
                    <p>Loading pricing data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="price-comparison">
            {/* Modern Header with Gradient */}
            <div className="modern-header">
                <div className="header-content">
                    <div className="title-section">
                        <h1 className="main-title">AI Pricing Dashboard</h1>
                        <p className="subtitle">Compare costs across leading AI providers in real-time</p>
                    </div>
                    <div className="status-section">
                        {lastUpdate && (
                            <div className="last-update">
                                <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                            </div>
                        )}
                        <div className="action-buttons">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="refresh-button"
                                title="Refresh pricing data"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                                </svg>
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="error-banner">
                        <div className="error-content">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Comparison Form */}
            <div className="modern-comparison-form">
                <div className="form-header">
                    <h2>Compare Pricing</h2>
                    <p>Enter your task details to see cost comparisons across providers</p>
                </div>

                <div className="form-container">
                    <div className="input-group">
                        <label htmlFor="task" className="form-label">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                            Task Description
                        </label>
                        <input
                            type="text"
                            id="task"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            placeholder="e.g., Generate a 500-word article, Summarize documents, Code review"
                            className="form-input"
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="tokens" className="form-label">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z" />
                                </svg>
                                Estimated Tokens
                            </label>
                            <input
                                type="number"
                                id="tokens"
                                value={estimatedTokens}
                                onChange={(e) => setEstimatedTokens(Number(e.target.value))}
                                min="1"
                                className="form-input"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="category" className="form-label">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V19A2,2 0 0,0 5,21H11V19H5V3H13V9H21Z" />
                                </svg>
                                Category
                            </label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="form-select"
                            >
                                <option value="all">All Categories</option>
                                <option value="text">Text Generation</option>
                                <option value="multimodal">Multimodal</option>
                                <option value="embedding">Embeddings</option>
                                <option value="code">Code Generation</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleComparePrice}
                        disabled={comparing}
                        className="compare-button"
                    >
                        {comparing ? (
                            <>
                                <div className="spinner"></div>
                                Comparing...
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M9,5V9H21V7H11V5H9M9,19H11V17H21V15H9V19M3,17H7V15H3V17M3,7V9H7V7H3M15,11V13H21V11H15M3,13H13V11H3V13Z" />
                                </svg>
                                Compare Prices
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Beautiful Comparison Results */}
            {comparison && (
                <div className="modern-results">
                    <div className="results-header">
                        <div className="results-title">
                            <h2>Price Comparison Results</h2>
                            <span className="results-count">{comparison.providers.length} models found</span>
                        </div>
                        <div className="sort-controls">
                            <label className="sort-label">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="sort-select"
                            >
                                <option value="cost">💰 Best Price</option>
                                <option value="provider">🏢 Provider</option>
                                <option value="model">🤖 Model Name</option>
                            </select>
                        </div>
                    </div>

                    <div className="results-grid">
                        {getSortedComparison().map((item, index) => (
                            <div key={`${item.provider}-${item.model}`} className={`result-card ${index === 0 ? 'best-deal' : ''}`}>
                                {index === 0 && <div className="best-badge">🏆 Best Price</div>}

                                <div className="card-header">
                                    <div className="provider-info">
                                        <h3 className="provider-name">{item.provider}</h3>
                                        <p className="model-name">{item.model}</p>
                                    </div>
                                    <div className="cost-display">
                                        <span className="total-cost">{formatPrice(item.estimatedCost)}</span>
                                        <span className="cost-label">total cost</span>
                                    </div>
                                </div>

                                <div className="cost-breakdown">
                                    <div className="cost-item">
                                        <span className="cost-type">Input</span>
                                        <span className="cost-value">{formatPrice(item.inputCost)}</span>
                                    </div>
                                    <div className="cost-item">
                                        <span className="cost-type">Output</span>
                                        <span className="cost-value">{formatPrice(item.outputCost)}</span>
                                    </div>
                                </div>

                                <div className="features-section">
                                    <div className="features-list">
                                        {item.features.slice(0, 3).map(feature => (
                                            <span
                                                key={feature}
                                                className={`feature-pill ${getCategoryColor(feature)}`}
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                        {item.features.length > 3 && (
                                            <span className="feature-pill more">+{item.features.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modern Models Overview */}
            <div className="models-section">
                <div className="section-header">
                    <h2>Available Models</h2>
                    <span className="models-count">{getFilteredModels().length} models across {allPricing.length} providers</span>
                </div>

                <div className="providers-container">
                    {allPricing.map(provider => {
                        const filteredModels = provider.models.filter(model =>
                            selectedCategory === 'all' || model.category === selectedCategory
                        );
                        const isExpanded = expandedProviders.has(provider.provider);
                        const visibleModels = isExpanded ? filteredModels : filteredModels.slice(0, 3);

                        return (
                            <div key={provider.provider} className="provider-section">
                                <div className="provider-header-modern">
                                    <div className="provider-info">
                                        <h3 className="provider-title">{provider.provider}</h3>
                                        <span className="provider-stats">
                                            {filteredModels.length} models • Updated {new Date(provider.lastUpdated).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {filteredModels.length > 3 && (
                                        <button
                                            onClick={() => toggleProviderExpansion(provider.provider)}
                                            className="expand-button"
                                        >
                                            <span>{isExpanded ? 'Show Less' : `Show All ${filteredModels.length}`}</span>
                                            <svg className={`expand-icon ${isExpanded ? 'rotated' : ''}`} viewBox="0 0 24 24" width="16" height="16">
                                                <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="models-grid">
                                    {visibleModels.map(model => (
                                        <div key={`${provider.provider}-${model.modelId}`} className="model-card">
                                            <div className="model-header">
                                                <div className="model-title">
                                                    <span className="model-name">{model.modelName}</span>
                                                    {model.isLatest && <span className="latest-tag">Latest</span>}
                                                </div>
                                                <span className={`category-badge ${getCategoryColor(model.category)}`}>
                                                    {model.category}
                                                </span>
                                            </div>

                                            <div className="model-details">
                                                <div className="pricing-row">
                                                    <div className="price-item">
                                                        <span className="price-label">Input</span>
                                                        <span className="price-value">
                                                            {formatModelPrice(model.inputPricePerMToken)}
                                                        </span>
                                                    </div>
                                                    <div className="price-item">
                                                        <span className="price-label">Output</span>
                                                        <span className="price-value">
                                                            {formatModelPrice(model.outputPricePerMToken)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="model-specs">
                                                    <div className="spec-item">
                                                        <svg viewBox="0 0 24 24" width="14" height="14">
                                                            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                                                        </svg>
                                                        <span>
                                                            {model.contextWindow !== null && model.contextWindow > 0
                                                                ? `${(model.contextWindow / 1000).toFixed(0)}K tokens`
                                                                : 'Variable'}
                                                        </span>
                                                    </div>
                                                    <div className="capabilities">
                                                        {model.capabilities.slice(0, 2).map(cap => (
                                                            <span key={cap} className="capability-tag">{cap}</span>
                                                        ))}
                                                        {model.capabilities.length > 2 && (
                                                            <span className="capability-tag more">+{model.capabilities.length - 2}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}; 
