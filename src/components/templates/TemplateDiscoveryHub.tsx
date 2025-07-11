import React, { useState, useEffect } from 'react';
import {
    FiZap,
    FiDollarSign,
    FiClock,
    FiTrendingUp,
    FiCode,
    FiEdit3,
    FiBarChart,
    FiPlay,
    FiArrowRight,
    FiUsers,
    FiList,
    FiBook,
} from 'react-icons/fi';

interface TemplateDiscoveryHubProps {
    onCreateTemplate: () => void;
    onStartTutorial: () => void;
    onViewTemplates: () => void;
    onUseTemplates?: () => void;
}

export const TemplateDiscoveryHub: React.FC<TemplateDiscoveryHubProps> = ({
    onCreateTemplate,
    onStartTutorial,
    onViewTemplates,
    onUseTemplates
}) => {
    const [stats, setStats] = useState({
        totalTemplates: 0,
        totalSavings: 0,
        timeSaved: 0,
        avgRating: 4.8
    });
    const [selectedUseCase, setSelectedUseCase] = useState(0);

    const useCases = [
        {
            title: "Code Documentation",
            description: "Generate comprehensive documentation for your code",
            example: "Create detailed API documentation for {{function_name}} that {{description}}",
            savings: "75% time saved",
            cost: "$0.15 vs $0.60",
            icon: <FiCode className="hub-icon" />
        },
        {
            title: "Content Writing",
            description: "Create engaging blog posts and articles",
            example: "Write a {{tone}} blog post about {{topic}} for {{audience}}",
            savings: "60% time saved",
            cost: "$0.25 vs $0.65",
            icon: <FiEdit3 className="hub-icon" />
        },
        {
            title: "Data Analysis",
            description: "Analyze and summarize complex datasets",
            example: "Analyze {{data_type}} and provide insights on {{metric}}",
            savings: "80% time saved",
            cost: "$0.30 vs $1.20",
            icon: <FiBarChart className="hub-icon" />
        },
        {
            title: "Creative Content",
            description: "Generate creative marketing and social content",
            example: "Create {{content_type}} for {{product}} targeting {{demographic}}",
            savings: "70% time saved",
            cost: "$0.20 vs $0.75",
            icon: <FiArrowRight className="hub-icon" />
        }
    ];

    const benefits = [
        {
            icon: <FiDollarSign className="benefit-icon cost" />,
            title: "Reduce AI Costs",
            description: "Save up to 80% on AI API costs with optimized prompts",
            metric: "Average 65% savings"
        },
        {
            icon: <FiClock className="benefit-icon time" />,
            title: "Save Time",
            description: "Reuse proven prompts instead of writing from scratch",
            metric: "2-5 minutes per use"
        },
        {
            icon: <FiTrendingUp className="benefit-icon performance" />,
            title: "Better Results",
            description: "Get consistent, high-quality outputs every time",
            metric: "40% better outputs"
        },
        {
            icon: <FiUsers className="benefit-icon team" />,
            title: "Team Collaboration",
            description: "Share best practices across your organization",
            metric: "10x faster onboarding"
        }
    ];

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Mock data for now - replace with actual API calls
            setStats({
                totalTemplates: 1247,
                totalSavings: 45230,
                timeSaved: 892,
                avgRating: 4.8
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    return (
        <div className="template-discovery-hub">
            <style>{`
                .template-discovery-hub {
                    padding: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    color: white;
                }

                .hero-section {
                    padding: 80px 40px;
                    text-align: center;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%),
                                url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                    position: relative;
                    overflow: hidden;
                }

                .hero-content h1 {
                    font-size: 3.5rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    background: linear-gradient(45deg, #fff, #e0e7ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-content p {
                    font-size: 1.5rem;
                    margin-bottom: 2rem;
                    color: rgba(255, 255, 255, 0.9);
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .hero-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    margin: 3rem auto;
                    max-width: 800px;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 1.5rem;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .stat-number {
                    font-size: 2.5rem;
                    font-weight: 700;
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.9rem;
                }

                .cta-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 2rem;
                }

                .btn-primary {
                    background: linear-gradient(45deg, #4f46e5, #7c3aed);
                    color: white;
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.6);
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 1rem 2rem;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    backdrop-filter: blur(10px);
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: translateY(-2px);
                }

                .benefits-section {
                    background: white;
                    color: #1f2937;
                    padding: 80px 40px;
                }

                .section-title {
                    text-align: center;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: #1f2937;
                }

                .section-subtitle {
                    text-align: center;
                    font-size: 1.2rem;
                    color: #6b7280;
                    margin-bottom: 4rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .benefit-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid #f3f4f6;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .benefit-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .benefit-icon {
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 1.5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .benefit-icon.cost {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }

                .benefit-icon.time {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                }

                .benefit-icon.performance {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    color: white;
                }

                .benefit-icon.team {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                }

                .benefit-card h3 {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #1f2937;
                }

                .benefit-card p {
                    color: #6b7280;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .benefit-metric {
                    font-weight: 600;
                    color: #4f46e5;
                    font-size: 0.9rem;
                }

                .use-cases-section {
                    background: #f8fafc;
                    padding: 80px 40px;
                    color: #1f2937;
                }

                .use-case-selector {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    max-width: 1000px;
                    margin: 0 auto 3rem;
                }

                .use-case-tab {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 15px;
                    border: 2px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    color: #1f2937;
                }

                .use-case-tab.active {
                    border-color: #4f46e5;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white;
                }

                .use-case-tab:hover {
                    border-color: #4f46e5;
                    transform: translateY(-2px);
                }

                .use-case-tab h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0.5rem 0;
                }

                .use-case-tab p {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin: 0;
                }

                .hub-icon {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto 1rem;
                    display: block;
                }

                .use-case-demo {
                    background: white;
                    border-radius: 20px;
                    padding: 3rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    max-width: 800px;
                    margin: 0 auto;
                    color: #1f2937;
                }

                .use-case-demo h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #1f2937;
                }

                .use-case-demo > p {
                    color: #6b7280;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .demo-example {
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin: 2rem 0;
                    font-family: 'Monaco', 'Courier New', monospace;
                    position: relative;
                    color: #374151;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .demo-metrics {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .demo-metric {
                    text-align: center;
                    padding: 1rem;
                    background: #f0f9ff;
                    border-radius: 10px;
                }

                .demo-metric-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0ea5e9;
                    display: block;
                }

                .demo-metric-label {
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .featured-section {
                    background: white;
                    padding: 80px 40px;
                }

                .featured-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .featured-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid #f3f4f6;
                    transition: all 0.3s ease;
                }

                .featured-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .template-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 1rem;
                }

                .template-name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .template-category {
                    background: #e0e7ff;
                    color: #4338ca;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .template-rating {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #f59e0b;
                    font-size: 0.9rem;
                }

                .template-description {
                    color: #6b7280;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .template-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: #6b7280;
                    margin-bottom: 1.5rem;
                }

                .template-actions {
                    display: flex;
                    gap: 1rem;
                }

                .btn-template {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: 1px solid #d1d5db;
                    background: white;
                    color: #374151;
                    border-radius: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .btn-template:hover {
                    background: #f9fafb;
                    border-color: #4f46e5;
                    color: #4f46e5;
                }

                .cta-section {
                    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                    color: white;
                    padding: 80px 40px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .cta-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
                    opacity: 0.3;
                }

                .cta-container {
                    position: relative;
                    z-index: 1;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .cta-content {
                    margin-bottom: 3rem;
                }

                .cta-content h2 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    background: linear-gradient(45deg, #fff, #e0e7ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .cta-content p {
                    font-size: 1.2rem;
                    margin-bottom: 2rem;
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.6;
                }

                .cta-button {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    padding: 1.25rem 3rem;
                    border: none;
                    border-radius: 60px;
                    font-weight: 600;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.4s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.4);
                    position: relative;
                    overflow: hidden;
                    min-width: 280px;
                    justify-content: center;
                }

                .cta-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.6s ease;
                }

                .cta-button:hover::before {
                    left: 100%;
                }

                .cta-button:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 20px 40px rgba(79, 70, 229, 0.6);
                }

                .cta-text {
                    font-size: 1.2rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .cta-icon {
                    width: 24px;
                    height: 24px;
                    transition: transform 0.3s ease;
                }

                .cta-button:hover .cta-icon {
                    transform: translateX(5px);
                }

                .cta-features {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    margin-top: 3rem;
                    opacity: 0.8;
                }

                .cta-feature {
                    text-align: center;
                    padding: 1rem;
                }

                .cta-feature-icon {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }

                .cta-feature h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: white;
                }

                .cta-feature p {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                }

                .secondary-cta-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-top: 2rem;
                    flex-wrap: wrap;
                }

                .secondary-cta-btn {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 40px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    backdrop-filter: blur(10px);
                }

                .secondary-cta-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .hero-content h1 {
                        font-size: 2.5rem;
                    }
                    
                    .hero-content p {
                        font-size: 1.2rem;
                    }
                    
                    .cta-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .use-case-selector {
                        grid-template-columns: 1fr;
                    }
                    
                    .demo-metrics {
                        grid-template-columns: 1fr;
                    }
                    
                    .featured-grid {
                        grid-template-columns: 1fr;
                    }

                    .cta-content h2 {
                        font-size: 2rem;
                    }

                    .cta-button {
                        padding: 1rem 2rem;
                        font-size: 1.1rem;
                        min-width: 240px;
                    }

                    .cta-features {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                }
            `}</style>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Transform Your AI Prompts Into Powerful Templates</h1>
                    <p>
                        Save time, reduce costs, and get consistent results with our intelligent
                        prompt template system. Join thousands of developers already saving money.
                    </p>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-number">{stats.totalTemplates.toLocaleString()}</span>
                            <span className="stat-label">Templates Created</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">${stats.totalSavings.toLocaleString()}</span>
                            <span className="stat-label">Total Savings</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{stats.timeSaved}h</span>
                            <span className="stat-label">Time Saved</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{stats.avgRating} ★</span>
                            <span className="stat-label">Average Rating</span>
                        </div>
                    </div>

                    <div className="cta-buttons">
                        <button className="btn-primary" onClick={onCreateTemplate}>
                            <FiZap />
                            Create Your First Template
                        </button>
                        <button className="btn-secondary" onClick={onStartTutorial}>
                            <FiPlay />
                            Watch Tutorial
                        </button>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <h2 className="section-title">Why Use Prompt Templates?</h2>
                <p className="section-subtitle">
                    Discover how templates can revolutionize your AI workflow and save you money
                </p>

                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-card">
                            <div className="benefit-icon">
                                {benefit.icon}
                            </div>
                            <h3>{benefit.title}</h3>
                            <p>{benefit.description}</p>
                            <span className="benefit-metric">{benefit.metric}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="use-cases-section">
                <h2 className="section-title">Popular Use Cases</h2>
                <p className="section-subtitle">
                    See how templates solve real problems across different domains
                </p>

                <div className="use-case-selector">
                    {useCases.map((useCase, index) => (
                        <div
                            key={index}
                            className={`use-case-tab ${selectedUseCase === index ? 'active' : ''}`}
                            onClick={() => setSelectedUseCase(index)}
                        >
                            {useCase.icon}
                            <h3>{useCase.title}</h3>
                            <p>{useCase.description}</p>
                        </div>
                    ))}
                </div>

                <div className="use-case-demo">
                    <h3>{useCases[selectedUseCase].title} Template Example</h3>
                    <p>{useCases[selectedUseCase].description}</p>

                    <div className="demo-example">
                        {useCases[selectedUseCase].example}
                    </div>

                    <div className="demo-metrics">
                        <div className="demo-metric">
                            <span className="demo-metric-value">{useCases[selectedUseCase].savings}</span>
                            <span className="demo-metric-label">Time Efficiency</span>
                        </div>
                        <div className="demo-metric">
                            <span className="demo-metric-value">{useCases[selectedUseCase].cost}</span>
                            <span className="demo-metric-label">Cost Comparison</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - View All Templates */}
            <section className="cta-section">
                <div className="cta-container">
                    <div className="cta-content">
                        <h2>Ready to Explore Our Template Library?</h2>
                        <p>
                            Browse through hundreds of professionally crafted templates,
                            organized by category and use case. Find the perfect starting point
                            for your next AI project.
                        </p>
                    </div>

                    <button onClick={onViewTemplates} className="cta-button">
                        <span className="cta-text">View All Templates</span>
                        <FiList className="cta-icon" />
                    </button>

                    <div className="cta-features">
                        <div className="cta-feature">
                            <div className="cta-feature-icon">
                                <FiCode />
                            </div>
                            <h4>1,200+ Templates</h4>
                            <p>Covering every use case</p>
                        </div>
                        <div className="cta-feature">
                            <div className="cta-feature-icon">
                                <FiTrendingUp />
                            </div>
                            <h4>Community Rated</h4>
                            <p>Best templates rise to the top</p>
                        </div>
                        <div className="cta-feature">
                            <div className="cta-feature-icon">
                                <FiZap />
                            </div>
                            <h4>Instant Use</h4>
                            <p>Copy, customize, and deploy</p>
                        </div>
                    </div>

                    {/* Additional CTA buttons */}
                    <div className="secondary-cta-buttons">
                        {onUseTemplates && (
                            <button onClick={onUseTemplates} className="secondary-cta-btn">
                                <FiPlay className="cta-icon" />
                                <span>Use Existing Templates</span>
                            </button>
                        )}
                        <button onClick={onCreateTemplate} className="secondary-cta-btn">
                            <FiZap className="cta-icon" />
                            <span>Create New Template</span>
                        </button>
                        <button onClick={onStartTutorial} className="secondary-cta-btn">
                            <FiBook className="cta-icon" />
                            <span>Learn How</span>
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}; 