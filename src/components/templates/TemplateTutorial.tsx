import React, { useState } from 'react';
import {
    FiSkipForward,
    FiSkipBack,
    FiCheck,
    FiX,
    FiZap,
    FiEdit3,
    FiEye,
    FiTarget,
    FiDollarSign,
    FiClock,
    FiArrowRight,
    FiHome
} from 'react-icons/fi';

interface TemplateTutorialProps {
    onClose: () => void;
    onCreateTemplate: () => void;
    onViewMarketplace: () => void;
}

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    content: React.ReactNode;
    type: 'info' | 'interactive' | 'demo' | 'completion';
    estimatedTime: number; // in minutes
}

export const TemplateTutorial: React.FC<TemplateTutorialProps> = ({
    onClose,
    onCreateTemplate,
    onViewMarketplace
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [userInput, setUserInput] = useState({
        samplePrompt: '',
        variables: [''],
        useCase: ''
    });

    const tutorialSteps: TutorialStep[] = [
        {
            id: 'welcome',
            title: 'Welcome to Template Mastery',
            description: 'Learn how to create powerful, reusable prompt templates',
            type: 'info',
            estimatedTime: 1,
            content: (
                <div className="welcome-content">
                    <div className="welcome-hero">
                        <FiZap className="welcome-icon" />
                        <h2>Master Template Creation</h2>
                        <p>
                            In the next 10 minutes, you'll learn how to create templates that save time,
                            reduce costs, and improve consistency in your AI interactions.
                        </p>
                    </div>

                    <div className="benefits-preview">
                        <div className="benefit-item">
                            <FiDollarSign className="benefit-icon cost" />
                            <div>
                                <h4>Save Money</h4>
                                <p>Reduce AI costs by up to 75% with optimized prompts</p>
                            </div>
                        </div>
                        <div className="benefit-item">
                            <FiClock className="benefit-icon time" />
                            <div>
                                <h4>Save Time</h4>
                                <p>Reuse proven prompts instead of writing from scratch</p>
                            </div>
                        </div>
                        <div className="benefit-item">
                            <FiTarget className="benefit-icon quality" />
                            <div>
                                <h4>Better Results</h4>
                                <p>Get consistent, high-quality outputs every time</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'what-are-templates',
            title: 'What Are Prompt Templates?',
            description: 'Understanding the basics of prompt templates',
            type: 'demo',
            estimatedTime: 2,
            content: (
                <div className="concept-explanation">
                    <div className="concept-visual">
                        <div className="before-after">
                            <div className="before">
                                <h4>❌ Without Templates</h4>
                                <div className="prompt-example bad">
                                    <p>Write a blog post about React hooks for developers</p>
                                    <p>Write a blog post about Vue composition API for developers</p>
                                    <p>Write a blog post about Angular signals for developers</p>
                                </div>
                                <div className="problems">
                                    <span>• Repetitive writing</span>
                                    <span>• Inconsistent quality</span>
                                    <span>• More tokens = Higher cost</span>
                                </div>
                            </div>

                            <div className="after">
                                <h4>✅ With Templates</h4>
                                <div className="prompt-example good">
                                    <p>Write a blog post about <span className="variable">{'{{topic}}'}</span> for <span className="variable">{'{{audience}}'}</span></p>
                                </div>
                                <div className="benefits">
                                    <span>• Write once, use many times</span>
                                    <span>• Consistent structure</span>
                                    <span>• Optimized for efficiency</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="key-concept">
                        <FiArrowRight className="concept-icon" />
                        <div>
                            <h4>Key Concept: Variables</h4>
                            <p>
                                Templates use variables like <code>{'{{topic}}'}</code> and <code>{'{{audience}}'}</code>
                                that can be filled in with different values each time you use the template.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'identify-use-case',
            title: 'Identify Your Use Case',
            description: 'Choose what type of template you want to create',
            type: 'interactive',
            estimatedTime: 2,
            content: (
                <div className="use-case-selector">
                    <h3>What do you want to create templates for?</h3>
                    <p>Select the use case that best matches your needs:</p>

                    <div className="use-case-options">
                        {[
                            {
                                id: 'content',
                                title: 'Content Creation',
                                description: 'Blog posts, articles, social media content',
                                example: 'Blog post templates, email campaigns, product descriptions',
                                icon: <FiEdit3 />
                            },
                            {
                                id: 'code',
                                title: 'Code & Documentation',
                                description: 'API docs, code comments, technical writing',
                                example: 'API documentation, code reviews, README files',
                                icon: <FiZap />
                            },
                            {
                                id: 'analysis',
                                title: 'Data Analysis',
                                description: 'Reports, insights, business intelligence',
                                example: 'Performance reports, data summaries, trend analysis',
                                icon: <FiTarget />
                            },
                            {
                                id: 'other',
                                title: 'Something Else',
                                description: 'Custom use case or mixed purposes',
                                example: 'Meeting summaries, creative writing, brainstorming',
                                icon: <FiArrowRight />
                            }
                        ].map((useCase) => (
                            <div
                                key={useCase.id}
                                className={`use-case-option ${userInput.useCase === useCase.id ? 'selected' : ''}`}
                                onClick={() => setUserInput(prev => ({ ...prev, useCase: useCase.id }))}
                            >
                                <div className="use-case-icon">{useCase.icon}</div>
                                <div className="use-case-info">
                                    <h4>{useCase.title}</h4>
                                    <p>{useCase.description}</p>
                                    <small>Examples: {useCase.example}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'write-first-prompt',
            title: 'Write Your First Template',
            description: 'Create a simple template with variables',
            type: 'interactive',
            estimatedTime: 3,
            content: (
                <div className="prompt-creator">
                    <h3>Let's create your first template</h3>
                    <p>Write a prompt that you use often, but replace specific values with variables.</p>

                    <div className="prompt-input-section">
                        <label htmlFor="sample-prompt">Your Template Content:</label>
                        <textarea
                            id="sample-prompt"
                            className="prompt-textarea"
                            value={userInput.samplePrompt}
                            onChange={(e) => setUserInput(prev => ({ ...prev, samplePrompt: e.target.value }))}
                            placeholder="Example: Write a professional email to {{recipient}} about {{subject}} with a {{tone}} tone..."
                            rows={6}
                        />
                        <div className="prompt-tips">
                            <h4>💡 Tips for great templates:</h4>
                            <ul>
                                <li>Use <code>{'{{variable_name}}'}</code> for values that change</li>
                                <li>Be specific about format and style requirements</li>
                                <li>Include context and examples when helpful</li>
                                <li>Keep it clear and concise</li>
                            </ul>
                        </div>
                    </div>

                    {userInput.samplePrompt && (
                        <div className="live-preview">
                            <h4>Live Preview:</h4>
                            <div className="preview-content">
                                {userInput.samplePrompt}
                            </div>
                            <div className="detected-variables">
                                <h5>Detected Variables:</h5>
                                {(userInput.samplePrompt.match(/\{\{([^}]+)\}\}/g) || []).map((variable, index) => (
                                    <span key={index} className="variable-tag">
                                        {variable}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'test-template',
            title: 'Test Your Template',
            description: 'See how variables work in practice',
            type: 'demo',
            estimatedTime: 2,
            content: (
                <div className="template-tester">
                    <h3>Let's test your template</h3>
                    <p>Fill in the variables to see how your template works:</p>

                    {userInput.samplePrompt ? (
                        <div className="template-demo">
                            <div className="variable-inputs">
                                {(userInput.samplePrompt.match(/\{\{([^}]+)\}\}/g) || []).map((variable, index) => {
                                    const varName = variable.replace(/[{}]/g, '');
                                    return (
                                        <div key={index} className="variable-input">
                                            <label>{varName}:</label>
                                            <input
                                                type="text"
                                                placeholder={`Enter ${varName}`}
                                                className="var-input"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="generated-output">
                                <h4>Generated Output:</h4>
                                <div className="output-preview">
                                    {userInput.samplePrompt}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-template">
                            <p>No template created yet. Go back to the previous step to create one!</p>
                        </div>
                    )}

                    <div className="testing-tips">
                        <h4>🎯 Testing Best Practices:</h4>
                        <ul>
                            <li>Try different values to ensure flexibility</li>
                            <li>Check that the output makes sense</li>
                            <li>Verify all variables are properly replaced</li>
                            <li>Test edge cases (long/short values, special characters)</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'save-and-organize',
            title: 'Save & Organize Templates',
            description: 'Learn how to save and categorize your templates',
            type: 'info',
            estimatedTime: 1,
            content: (
                <div className="organization-guide">
                    <h3>Organizing Your Templates</h3>

                    <div className="organization-tips">
                        <div className="tip-section">
                            <h4>📁 Categorization</h4>
                            <p>Use categories to group similar templates:</p>
                            <div className="category-examples">
                                <span className="category-tag coding">Coding</span>
                                <span className="category-tag writing">Writing</span>
                                <span className="category-tag analysis">Analysis</span>
                                <span className="category-tag creative">Creative</span>
                                <span className="category-tag business">Business</span>
                            </div>
                        </div>

                        <div className="tip-section">
                            <h4>🏷️ Tags</h4>
                            <p>Add descriptive tags for easy searching:</p>
                            <div className="tag-examples">
                                <span className="tag">email</span>
                                <span className="tag">documentation</span>
                                <span className="tag">seo</span>
                                <span className="tag">reports</span>
                            </div>
                        </div>

                        <div className="tip-section">
                            <h4>📝 Descriptions</h4>
                            <p>Write clear descriptions explaining when to use each template.</p>
                        </div>

                        <div className="tip-section">
                            <h4>⭐ Favorites</h4>
                            <p>Mark frequently used templates as favorites for quick access.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'completion',
            title: 'Congratulations!',
            description: 'You\'ve mastered template creation',
            type: 'completion',
            estimatedTime: 1,
            content: (
                <div className="completion-content">
                    <div className="success-animation">
                        <FiCheck className="success-icon" />
                        <h2>You're Now a Template Master! 🎉</h2>
                    </div>

                    <div className="achievement-summary">
                        <h3>What you've learned:</h3>
                        <div className="achievements">
                            <div className="achievement">
                                <FiCheck className="check-icon" />
                                <span>Understanding prompt templates and variables</span>
                            </div>
                            <div className="achievement">
                                <FiCheck className="check-icon" />
                                <span>Identifying the right use cases for templates</span>
                            </div>
                            <div className="achievement">
                                <FiCheck className="check-icon" />
                                <span>Creating your first template with variables</span>
                            </div>
                            <div className="achievement">
                                <FiCheck className="check-icon" />
                                <span>Testing and validating template functionality</span>
                            </div>
                            <div className="achievement">
                                <FiCheck className="check-icon" />
                                <span>Best practices for organizing templates</span>
                            </div>
                        </div>
                    </div>

                    <div className="next-steps">
                        <h3>What's Next?</h3>
                        <div className="next-step-actions">
                            <button className="action-btn primary" onClick={onCreateTemplate}>
                                <FiZap />
                                Create Your First Real Template
                            </button>
                            <button className="action-btn secondary" onClick={onViewMarketplace}>
                                <FiEye />
                                Explore Template Marketplace
                            </button>
                        </div>
                    </div>

                    <div className="potential-savings">
                        <h3>Your Potential Savings:</h3>
                        <div className="savings-calculator">
                            <div className="saving-item">
                                <FiDollarSign className="saving-icon" />
                                <div>
                                    <strong>$50-200/month</strong>
                                    <p>Typical cost savings with templates</p>
                                </div>
                            </div>
                            <div className="saving-item">
                                <FiClock className="saving-icon" />
                                <div>
                                    <strong>5-15 hours/week</strong>
                                    <p>Time saved on prompt writing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentStepData = tutorialSteps[currentStep];
    const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceed = () => {
        switch (currentStepData.id) {
            case 'identify-use-case':
                return userInput.useCase !== '';
            case 'write-first-prompt':
                return userInput.samplePrompt.trim() !== '' && userInput.samplePrompt.includes('{{');
            default:
                return true;
        }
    };

    const totalTime = tutorialSteps.reduce((sum, step) => sum + step.estimatedTime, 0);
    const completedTime = tutorialSteps.slice(0, currentStep + 1).reduce((sum, step) => sum + step.estimatedTime, 0);

    return (
        <div className="template-tutorial">
            <style jsx>{`
                .template-tutorial {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .tutorial-container {
                    background: white;
                    border-radius: 20px;
                    max-width: 800px;
                    width: 100%;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                }

                .tutorial-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                    position: relative;
                }

                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 0.5rem;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .header-content {
                    margin-bottom: 2rem;
                }

                .tutorial-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .tutorial-description {
                    opacity: 0.9;
                    margin-bottom: 1rem;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin-bottom: 1rem;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: white;
                    border-radius: 50px;
                    transition: width 0.3s ease;
                    width: ${progress}%;
                }

                .tutorial-content {
                    padding: 2rem;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .tutorial-footer {
                    background: #f9fafb;
                    padding: 1.5rem 2rem;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                }

                .nav-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .nav-btn.secondary {
                    background: #6b7280;
                    color: white;
                }

                .nav-btn.primary {
                    background: #667eea;
                    color: white;
                }

                .nav-btn.primary:hover:not(:disabled) {
                    background: #5a67d8;
                }

                .nav-btn.secondary:hover:not(:disabled) {
                    background: #4b5563;
                }

                /* Welcome Content */
                .welcome-content {
                    text-align: center;
                }

                .welcome-hero {
                    margin-bottom: 2rem;
                }

                .welcome-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 1rem;
                    color: #667eea;
                    display: block;
                }

                .welcome-hero h2 {
                    font-size: 2rem;
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .welcome-hero p {
                    font-size: 1.1rem;
                    color: #6b7280;
                    line-height: 1.6;
                }

                .benefits-preview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

                .benefit-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 10px;
                }

                .benefit-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                }

                .benefit-icon.cost {
                    background: #10b981;
                }

                .benefit-icon.time {
                    background: #3b82f6;
                }

                .benefit-icon.quality {
                    background: #8b5cf6;
                }

                .benefit-item h4 {
                    color: #1f2937;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .benefit-item p {
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                /* Concept Explanation */
                .concept-explanation {
                    max-width: 100%;
                }

                .before-after {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .before,
                .after {
                    padding: 1.5rem;
                    border-radius: 10px;
                    border: 2px solid transparent;
                }

                .before {
                    background: #fef2f2;
                    border-color: #fca5a5;
                }

                .after {
                    background: #f0fdf4;
                    border-color: #86efac;
                }

                .before h4,
                .after h4 {
                    margin-bottom: 1rem;
                    font-weight: 600;
                }

                .prompt-example {
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    font-family: monospace;
                    line-height: 1.4;
                }

                .prompt-example.bad {
                    border-left: 4px solid #ef4444;
                }

                .prompt-example.good {
                    border-left: 4px solid #10b981;
                }

                .variable {
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .problems,
                .benefits {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .problems span {
                    color: #dc2626;
                }

                .benefits span {
                    color: #059669;
                }

                .key-concept {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: #fffbeb;
                    border: 1px solid #fbbf24;
                    border-radius: 10px;
                }

                .concept-icon {
                    width: 40px;
                    height: 40px;
                    color: #f59e0b;
                    flex-shrink: 0;
                }

                .key-concept code {
                    background: #f3f4f6;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-family: monospace;
                }

                /* Use Case Selector */
                .use-case-selector h3 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .use-case-selector p {
                    color: #6b7280;
                    margin-bottom: 2rem;
                }

                .use-case-options {
                    display: grid;
                    gap: 1rem;
                }

                .use-case-option {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .use-case-option:hover {
                    border-color: #667eea;
                    background: #f8fafc;
                }

                .use-case-option.selected {
                    border-color: #667eea;
                    background: #eef2ff;
                }

                .use-case-icon {
                    width: 50px;
                    height: 50px;
                    background: #667eea;
                    color: white;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .use-case-info h4 {
                    color: #1f2937;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .use-case-info p {
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }

                .use-case-info small {
                    color: #9ca3af;
                    font-style: italic;
                }

                /* Prompt Creator */
                .prompt-creator h3 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .prompt-creator > p {
                    color: #6b7280;
                    margin-bottom: 2rem;
                }

                .prompt-input-section label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .prompt-textarea {
                    width: 100%;
                    padding: 1rem;
                    border: 2px solid #d1d5db;
                    border-radius: 10px;
                    font-family: monospace;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    resize: vertical;
                    transition: border-color 0.2s ease;
                }

                .prompt-textarea:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .prompt-tips {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #f0f9ff;
                    border-radius: 8px;
                    border: 1px solid #bae6fd;
                }

                .prompt-tips h4 {
                    color: #0369a1;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }

                .prompt-tips ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .prompt-tips li {
                    color: #0c4a6e;
                    font-size: 0.85rem;
                    margin-bottom: 0.25rem;
                    padding-left: 1rem;
                    position: relative;
                }

                .prompt-tips li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #0369a1;
                }

                .prompt-tips code {
                    background: #dbeafe;
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                    font-size: 0.8rem;
                }

                .live-preview {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }

                .live-preview h4 {
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .preview-content {
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    border: 1px solid #d1d5db;
                    margin-bottom: 1rem;
                }

                .detected-variables h5 {
                    color: #374151;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }

                .variable-tag {
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-family: monospace;
                    margin-right: 0.5rem;
                    margin-bottom: 0.5rem;
                    display: inline-block;
                }

                /* Template Tester */
                .template-tester h3 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .template-tester > p {
                    color: #6b7280;
                    margin-bottom: 2rem;
                }

                .variable-inputs {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .variable-input label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .var-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    transition: border-color 0.2s ease;
                }

                .var-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .generated-output h4 {
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .output-preview {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    padding: 1rem;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }

                .testing-tips {
                    margin-top: 2rem;
                    padding: 1rem;
                    background: #fef3c7;
                    border: 1px solid #fbbf24;
                    border-radius: 8px;
                }

                .testing-tips h4 {
                    color: #92400e;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }

                .testing-tips ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .testing-tips li {
                    color: #a16207;
                    font-size: 0.85rem;
                    margin-bottom: 0.25rem;
                    padding-left: 1rem;
                    position: relative;
                }

                .testing-tips li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #92400e;
                }

                /* Organization Guide */
                .organization-guide h3 {
                    color: #1f2937;
                    margin-bottom: 2rem;
                }

                .organization-tips {
                    display: grid;
                    gap: 1.5rem;
                }

                .tip-section h4 {
                    color: #374151;
                    margin-bottom: 0.5rem;
                    font-size: 1rem;
                }

                .tip-section p {
                    color: #6b7280;
                    margin-bottom: 1rem;
                }

                .category-examples,
                .tag-examples {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .category-tag {
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: white;
                }

                .category-tag.coding {
                    background: #3b82f6;
                }

                .category-tag.writing {
                    background: #10b981;
                }

                .category-tag.analysis {
                    background: #8b5cf6;
                }

                .category-tag.creative {
                    background: #f59e0b;
                }

                .category-tag.business {
                    background: #6366f1;
                }

                .tag {
                    background: #e5e7eb;
                    color: #374151;
                    padding: 0.25rem 0.75rem;
                    border-radius: 50px;
                    font-size: 0.8rem;
                }

                /* Completion Content */
                .completion-content {
                    text-align: center;
                }

                .success-animation {
                    margin-bottom: 2rem;
                }

                .success-icon {
                    width: 80px;
                    height: 80px;
                    color: #10b981;
                    margin: 0 auto 1rem;
                    display: block;
                }

                .success-animation h2 {
                    color: #1f2937;
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }

                .achievement-summary {
                    margin-bottom: 2rem;
                    text-align: left;
                }

                .achievement-summary h3 {
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .achievements {
                    display: grid;
                    gap: 0.75rem;
                }

                .achievement {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: #f0fdf4;
                    border-radius: 8px;
                }

                .check-icon {
                    color: #10b981;
                    flex-shrink: 0;
                }

                .achievement span {
                    color: #047857;
                    font-weight: 500;
                }

                .next-steps {
                    margin-bottom: 2rem;
                }

                .next-steps h3 {
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .next-step-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .action-btn {
                    padding: 1rem 2rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                    font-size: 1rem;
                }

                .action-btn.primary {
                    background: #667eea;
                    color: white;
                }

                .action-btn.secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .action-btn:hover {
                    transform: translateY(-1px);
                }

                .potential-savings {
                    text-align: left;
                }

                .potential-savings h3 {
                    color: #1f2937;
                    margin-bottom: 1rem;
                }

                .savings-calculator {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .saving-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #ecfdf5;
                    border-radius: 10px;
                    border: 1px solid #a7f3d0;
                }

                .saving-icon {
                    width: 40px;
                    height: 40px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .saving-item strong {
                    color: #047857;
                    font-size: 1.1rem;
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .saving-item p {
                    color: #065f46;
                    font-size: 0.9rem;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .template-tutorial {
                        padding: 1rem;
                    }
                    
                    .before-after {
                        grid-template-columns: 1fr;
                    }
                    
                    .benefits-preview {
                        grid-template-columns: 1fr;
                    }
                    
                    .variable-inputs {
                        grid-template-columns: 1fr;
                    }
                    
                    .next-step-actions {
                        flex-direction: column;
                    }
                    
                    .savings-calculator {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="tutorial-container">
                <div className="tutorial-header">
                    <button className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>

                    <div className="header-content">
                        <h1 className="tutorial-title">{currentStepData.title}</h1>
                        <p className="tutorial-description">{currentStepData.description}</p>
                    </div>

                    <div className="progress-info">
                        <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                        <span>{completedTime} / {totalTime} min</span>
                    </div>

                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>

                <div className="tutorial-content">
                    {currentStepData.content}
                </div>

                <div className="tutorial-footer">
                    <button
                        className="nav-btn secondary"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                    >
                        <FiSkipBack />
                        Previous
                    </button>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {currentStep === tutorialSteps.length - 1 ? (
                            <button className="nav-btn secondary" onClick={onClose}>
                                <FiHome />
                                Finish Tutorial
                            </button>
                        ) : (
                            <button
                                className="nav-btn primary"
                                onClick={handleNext}
                                disabled={!canProceed()}
                            >
                                Next
                                <FiSkipForward />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 