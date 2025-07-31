import React, { useState } from "react";
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiZap,
  FiCode,
  FiEdit3,
  FiBarChart,
  FiBriefcase,
  FiGlobe,
  FiEye,
  FiRefreshCw,
  FiSave,
  FiX,
} from "react-icons/fi";
import { Modal } from "../common/Modal";
import { TemplateVariable } from "../../types/promptTemplate.types";

interface TemplateCreationWizardProps {
  onClose: () => void;
  onSubmit: (templateData: any) => void;
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  template: string;
  variables: TemplateVariable[];
  tags: string[];
  estimatedTokens: number;
  example: string;
}

export const TemplateCreationWizard: React.FC<TemplateCreationWizardProps> = ({
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
    content: "",
    category: "general",
    variables: [] as TemplateVariable[],
    metadata: {
      tags: [] as string[],
      estimatedTokens: 0,
    },
  });
  const [previewVariables, setPreviewVariables] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);

  const useCases: UseCase[] = [
    {
      id: "api-docs",
      title: "API Documentation",
      description: "Generate comprehensive API documentation",
      icon: <FiCode className="use-case-icon" />,
      category: "coding",
      template: `Generate comprehensive API documentation for {{function_name}}.

**Function Purpose:** {{purpose}}
**Parameters:** {{parameters}}
**Return Type:** {{return_type}}

Include:
- Clear description of what the function does
- Parameter explanations with types and requirements
- Return value explanation
- Usage examples
- Error handling information
- Performance considerations`,
      variables: [
        {
          name: "function_name",
          description: "Name of the function",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "purpose",
          description: "What the function does",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "parameters",
          description: "Function parameters",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "return_type",
          description: "What the function returns",
          defaultValue: "",
          required: true,
          type: "text",
        },
      ],
      tags: ["documentation", "api", "coding"],
      estimatedTokens: 350,
      example:
        "Perfect for documenting REST API endpoints, SDK functions, and code libraries",
    },
    {
      id: "blog-post",
      title: "Blog Post Writing",
      description: "Create engaging blog content",
      icon: <FiEdit3 className="use-case-icon" />,
      category: "writing",
      template: `Write a {{tone}} blog post about {{topic}} for {{audience}}.

**Target Length:** {{word_count}} words
**Key Points to Cover:**
{{key_points}}

Structure:
1. Compelling headline and introduction
2. Main content with clear sections
3. Practical examples and actionable advice
4. Strong conclusion with call-to-action

Style Requirements:
- {{tone}} tone throughout
- SEO-optimized with relevant keywords
- Include relevant statistics or data
- Easy to read formatting with subheadings`,
      variables: [
        {
          name: "topic",
          description: "Blog post topic",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "tone",
          description: "Writing tone (professional, casual, etc.)",
          defaultValue: "professional",
          required: true,
          type: "select",
          options: [
            "professional",
            "casual",
            "friendly",
            "authoritative",
            "conversational",
          ],
        },
        {
          name: "audience",
          description: "Target audience",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "word_count",
          description: "Approximate word count",
          defaultValue: "800-1000",
          required: false,
          type: "text",
        },
        {
          name: "key_points",
          description: "Key points to cover",
          defaultValue: "",
          required: true,
          type: "text",
        },
      ],
      tags: ["content", "blog", "writing"],
      estimatedTokens: 450,
      example:
        "Great for creating technical blogs, marketing content, and thought leadership articles",
    },
    {
      id: "data-analysis",
      title: "Data Analysis Report",
      description: "Analyze and summarize data insights",
      icon: <FiBarChart className="use-case-icon" />,
      category: "analysis",
      template: `Analyze the {{data_type}} data and provide insights on {{metric}}.

**Dataset Overview:**
- Data source: {{data_source}}
- Time period: {{time_period}}
- Sample size: {{sample_size}}

**Analysis Requirements:**
1. Summary statistics and key metrics
2. Trends and patterns identification
3. Notable outliers or anomalies
4. Correlation analysis
5. Business implications
6. Recommendations for action

**Output Format:**
- Executive summary
- Detailed findings with visualizations suggestions
- Data-driven recommendations
- Next steps and follow-up actions

Focus on {{metric}} as the primary metric of interest.`,
      variables: [
        {
          name: "data_type",
          description: "Type of data being analyzed",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "metric",
          description: "Primary metric to analyze",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "data_source",
          description: "Where the data comes from",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "time_period",
          description: "Time range of the data",
          defaultValue: "",
          required: false,
          type: "text",
        },
        {
          name: "sample_size",
          description: "Number of data points",
          defaultValue: "",
          required: false,
          type: "text",
        },
      ],
      tags: ["analysis", "data", "reporting"],
      estimatedTokens: 400,
      example:
        "Perfect for business analytics, research reports, and performance analysis",
    },
    {
      id: "marketing-copy",
      title: "Marketing Copy",
      description: "Generate compelling marketing content",
      icon: <FiArrowRight className="use-case-icon" />,
      category: "creative",
      template: `Create {{content_type}} for {{product}} targeting {{demographic}}.

**Product Details:**
- Product name: {{product}}
- Key features: {{features}}
- Unique value proposition: {{value_prop}}
- Price point: {{price_range}}

**Target Audience:**
- Demographics: {{demographic}}
- Pain points: {{pain_points}}
- Motivations: {{motivations}}

**Content Requirements:**
- Compelling headline that grabs attention
- Clear value proposition and benefits
- Address customer pain points
- Include social proof if applicable
- Strong call-to-action
- {{content_type}} specific formatting

Tone: {{tone}}
Length: {{length}}`,
      variables: [
        {
          name: "content_type",
          description: "Type of marketing content",
          defaultValue: "",
          required: true,
          type: "select",
          options: [
            "email campaign",
            "social media post",
            "landing page",
            "ad copy",
            "product description",
          ],
        },
        {
          name: "product",
          description: "Product or service name",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "demographic",
          description: "Target demographic",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "features",
          description: "Key product features",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "value_prop",
          description: "Unique value proposition",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "pain_points",
          description: "Customer pain points",
          defaultValue: "",
          required: false,
          type: "text",
        },
        {
          name: "tone",
          description: "Marketing tone",
          defaultValue: "persuasive",
          required: false,
          type: "text",
        },
        {
          name: "length",
          description: "Content length",
          defaultValue: "medium",
          required: false,
          type: "text",
        },
      ],
      tags: ["marketing", "copywriting", "creative"],
      estimatedTokens: 380,
      example: "Ideal for email campaigns, social media, and sales copy",
    },
    {
      id: "meeting-summary",
      title: "Meeting Summary",
      description: "Summarize meeting notes and action items",
      icon: <FiBriefcase className="use-case-icon" />,
      category: "business",
      template: `Summarize the {{meeting_type}} meeting from {{date}}.

**Meeting Details:**
- Date: {{date}}
- Attendees: {{attendees}}
- Duration: {{duration}}
- Agenda: {{agenda}}

**Meeting Notes:**
{{raw_notes}}

**Required Output:**
1. Executive Summary (2-3 sentences)
2. Key Discussion Points
3. Decisions Made
4. Action Items with owners and deadlines
5. Next Steps
6. Follow-up Required

Format the action items as a numbered list with:
- Task description
- Assigned person
- Due date
- Priority level`,
      variables: [
        {
          name: "meeting_type",
          description: "Type of meeting",
          defaultValue: "",
          required: true,
          type: "select",
          options: [
            "team standup",
            "project review",
            "client meeting",
            "board meeting",
            "planning session",
          ],
        },
        {
          name: "date",
          description: "Meeting date",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "attendees",
          description: "Meeting attendees",
          defaultValue: "",
          required: true,
          type: "text",
        },
        {
          name: "duration",
          description: "Meeting duration",
          defaultValue: "",
          required: false,
          type: "text",
        },
        {
          name: "agenda",
          description: "Meeting agenda",
          defaultValue: "",
          required: false,
          type: "text",
        },
        {
          name: "raw_notes",
          description: "Raw meeting notes",
          defaultValue: "",
          required: true,
          type: "text",
        },
      ],
      tags: ["business", "meeting", "summary"],
      estimatedTokens: 320,
      example:
        "Turn messy meeting notes into professional summaries and clear action items",
    },
    {
      id: "custom",
      title: "Custom Template",
      description: "Start from scratch with a blank template",
      icon: <FiGlobe className="use-case-icon" />,
      category: "custom",
      template: "Write your custom prompt template here...",
      variables: [],
      tags: ["custom"],
      estimatedTokens: 200,
      example: "Create your own template for any specific use case",
    },
  ];

  const steps = [
    { title: "Choose Use Case", description: "Select what you want to create" },
    {
      title: "Customize Content",
      description: "Tailor the template to your needs",
    },
    { title: "Preview & Save", description: "Review and save your template" },
  ];

  const handleUseCaseSelect = (useCase: UseCase) => {
    setSelectedUseCase(useCase);
    setTemplateData({
      name: useCase.title,
      description: useCase.description,
      content: useCase.template,
      category: useCase.category,
      variables: useCase.variables,
      metadata: {
        tags: useCase.tags,
        estimatedTokens: useCase.estimatedTokens,
      },
    });

    // Initialize preview variables with default values
    const initialPreviewVars: Record<string, string> = {};
    useCase.variables.forEach((variable) => {
      initialPreviewVars[variable.name] =
        variable.defaultValue || `[${variable.name}]`;
    });
    setPreviewVariables(initialPreviewVars);

    setCurrentStep(1);
  };

  const generatePreview = () => {
    let preview = templateData.content;
    templateData.variables.forEach((variable) => {
      const value = previewVariables[variable.name] || `[${variable.name}]`;
      const regex = new RegExp(`{{${variable.name}}}`, "g");
      preview = preview.replace(regex, value);
    });
    return preview;
  };

  const handleVariableChange = (
    index: number,
    field: keyof TemplateVariable,
    value: any,
  ) => {
    const newVariables = [...templateData.variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setTemplateData((prev) => ({ ...prev, variables: newVariables }));
  };

  const addVariable = () => {
    const newVariable: TemplateVariable = {
      name: "",
      description: "",
      defaultValue: "",
      required: true,
      type: "text",
    };
    setTemplateData((prev) => ({
      ...prev,
      variables: [...prev.variables, newVariable],
    }));
  };

  const removeVariable = (index: number) => {
    setTemplateData((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(templateData);
      onClose();
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedUseCase !== null;
      case 1:
        return templateData.name.trim() && templateData.content.trim();
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New Template"
      size="lg"
    >
      <div className="template-wizard">
        <style>{`
                    .template-wizard {
                        max-height: 90vh;
                        overflow-y: auto;
                    }

                    .wizard-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 2rem;
                        margin: -1.5rem -1.5rem 0;
                        border-radius: 15px 15px 0 0;
                    }

                    .wizard-title {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin-bottom: 1rem;
                        text-align: center;
                    }

                    .step-indicator {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1rem;
                    }

                    .step {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 0.5rem;
                        flex: 1;
                        max-width: 120px;
                    }

                    .step-number {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    }

                    .step.active .step-number {
                        background: white;
                        color: #667eea;
                    }

                    .step.completed .step-number {
                        background: #10b981;
                        color: white;
                    }

                    .step-title {
                        font-size: 0.8rem;
                        text-align: center;
                        opacity: 0.8;
                    }

                    .step.active .step-title {
                        opacity: 1;
                        font-weight: 600;
                    }

                    .step-connector {
                        height: 2px;
                        background: rgba(255, 255, 255, 0.3);
                        flex: 1;
                        margin: 0 0.5rem;
                        align-self: center;
                        margin-top: -20px;
                    }

                    .wizard-content {
                        padding: 2rem;
                    }

                    .use-case-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 1.5rem;
                        margin-bottom: 2rem;
                    }

                    .use-case-card {
                        background: white;
                        border: 2px solid #e5e7eb;
                        border-radius: 15px;
                        padding: 1.5rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-align: center;
                    }

                    .use-case-card:hover {
                        border-color: #667eea;
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
                    }

                    .use-case-card.selected {
                        border-color: #667eea;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }

                    .use-case-icon {
                        width: 40px;
                        height: 40px;
                        margin: 0 auto 1rem;
                        display: block;
                    }

                    .use-case-title {
                        font-size: 1.1rem;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                    }

                    .use-case-description {
                        font-size: 0.9rem;
                        opacity: 0.8;
                        margin-bottom: 1rem;
                    }

                    .use-case-example {
                        font-size: 0.8rem;
                        opacity: 0.7;
                        font-style: italic;
                    }

                    .customization-section {
                        margin-bottom: 2rem;
                    }

                    .section-title {
                        font-size: 1.2rem;
                        font-weight: 600;
                        margin-bottom: 1rem;
                        color: #1f2937;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .form-group {
                        margin-bottom: 1.5rem;
                    }

                    .form-label {
                        display: block;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        color: #374151;
                    }

                    .form-input {
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 0.9rem;
                        transition: border-color 0.2s ease;
                    }

                    .form-input:focus {
                        outline: none;
                        border-color: #667eea;
                        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    }

                    .form-textarea {
                        min-height: 120px;
                        font-family: 'Monaco', 'Courier New', monospace;
                        resize: vertical;
                    }

                    .variable-card {
                        background: #f9fafb;
                        border: 1px solid #e5e7eb;
                        border-radius: 10px;
                        padding: 1rem;
                        margin-bottom: 1rem;
                    }

                    .variable-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                    }

                    .variable-title {
                        font-weight: 600;
                        color: #1f2937;
                    }

                    .remove-btn {
                        background: #ef4444;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                    }

                    .remove-btn:hover {
                        background: #dc2626;
                    }

                    .variable-fields {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                    }

                    .add-variable-btn {
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 0.75rem 1rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background-color 0.2s ease;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .add-variable-btn:hover {
                        background: #5a67d8;
                    }

                    .preview-section {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 10px;
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                    }

                    .preview-content {
                        background: white;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 1rem;
                        font-family: 'Monaco', 'Courier New', monospace;
                        font-size: 0.9rem;
                        line-height: 1.6;
                        white-space: pre-wrap;
                        max-height: 300px;
                        overflow-y: auto;
                    }

                    .preview-variables {
                        margin-bottom: 1rem;
                    }

                    .preview-variable {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 0.5rem;
                    }

                    .preview-variable-label {
                        min-width: 120px;
                        font-weight: 500;
                        color: #374151;
                    }

                    .preview-variable-input {
                        flex: 1;
                        padding: 0.5rem;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 0.8rem;
                    }

                    .wizard-actions {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1.5rem 2rem;
                        border-top: 1px solid #e5e7eb;
                        margin: 0 -2rem -1.5rem;
                        background: #f9fafb;
                        border-radius: 0 0 15px 15px;
                    }

                    .btn {
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        border: none;
                    }

                    .btn-secondary {
                        background: #6b7280;
                        color: white;
                    }

                    .btn-secondary:hover {
                        background: #4b5563;
                    }

                    .btn-primary {
                        background: #667eea;
                        color: white;
                    }

                    .btn-primary:hover {
                        background: #5a67d8;
                    }

                    .btn-primary:disabled {
                        background: #9ca3af;
                        cursor: not-allowed;
                        opacity: 0.5;
                    }

                    .btn-success {
                        background: #10b981;
                        color: white;
                    }

                    .btn-success:hover {
                        background: #059669;
                    }

                    @media (max-width: 768px) {
                        .use-case-grid {
                            grid-template-columns: 1fr;
                        }
                        
                        .variable-fields {
                            grid-template-columns: 1fr;
                        }
                        
                        .wizard-actions {
                            flex-direction: column;
                            gap: 1rem;
                        }
                        
                        .wizard-content {
                            padding: 1rem;
                        }
                    }
                `}</style>

        <div className="wizard-header">
          <h2 className="wizard-title">Template Creation Wizard</h2>
          <div className="step-indicator">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div
                  className={`step ${currentStep === index ? "active" : ""} ${currentStep > index ? "completed" : ""}`}
                >
                  <div className="step-number">
                    {currentStep > index ? <FiCheck /> : index + 1}
                  </div>
                  <span className="step-title">{step.title}</span>
                </div>
                {index < steps.length - 1 && <div className="step-connector" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="wizard-content">
          {/* Step 1: Choose Use Case */}
          {currentStep === 0 && (
            <div>
              <h3 className="section-title">
                <FiZap />
                Choose Your Use Case
              </h3>
              <p style={{ marginBottom: "2rem", color: "#6b7280" }}>
                Select a template type that matches what you want to create
              </p>

              <div className="use-case-grid">
                {useCases.map((useCase) => (
                  <div
                    key={useCase.id}
                    className={`use-case-card ${selectedUseCase?.id === useCase.id ? "selected" : ""}`}
                    onClick={() => handleUseCaseSelect(useCase)}
                  >
                    {useCase.icon}
                    <h4 className="use-case-title">{useCase.title}</h4>
                    <p className="use-case-description">
                      {useCase.description}
                    </p>
                    <p className="use-case-example">{useCase.example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Customize Content */}
          {currentStep === 1 && selectedUseCase && (
            <div>
              <h3 className="section-title">
                <FiEdit3 />
                Customize Your Template
              </h3>

              <div className="customization-section">
                <div className="form-group">
                  <label className="form-label">Template Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={templateData.name}
                    onChange={(e) =>
                      setTemplateData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Give your template a descriptive name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={templateData.description}
                    onChange={(e) =>
                      setTemplateData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what this template does"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Template Content</label>
                  <textarea
                    className="form-input form-textarea"
                    value={templateData.content}
                    onChange={(e) =>
                      setTemplateData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Write your prompt template here..."
                  />
                  <small style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    Use {`{{variable_name}}`} for variables that users can
                    customize
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Variables</label>
                  {templateData.variables.map((variable, index) => (
                    <div key={index} className="variable-card">
                      <div className="variable-header">
                        <span className="variable-title">
                          Variable {index + 1}
                        </span>
                        <button
                          className="remove-btn"
                          onClick={() => removeVariable(index)}
                        >
                          <FiX />
                        </button>
                      </div>
                      <div className="variable-fields">
                        <div>
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variable.name}
                            onChange={(e) =>
                              handleVariableChange(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="variable_name"
                          />
                        </div>
                        <div>
                          <label className="form-label">Type</label>
                          <select
                            className="form-input"
                            value={variable.type || "text"}
                            onChange={(e) =>
                              handleVariableChange(
                                index,
                                "type",
                                e.target.value,
                              )
                            }
                          >
                            <option value="text">Text</option>
                            <option value="select">Select</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variable.description || ""}
                            onChange={(e) =>
                              handleVariableChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Describe this variable"
                          />
                        </div>
                        <div>
                          <label className="form-label">Default Value</label>
                          <input
                            type="text"
                            className="form-input"
                            value={variable.defaultValue || ""}
                            onChange={(e) =>
                              handleVariableChange(
                                index,
                                "defaultValue",
                                e.target.value,
                              )
                            }
                            placeholder="Default value (optional)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="add-variable-btn" onClick={addVariable}>
                    Add Variable
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Save */}
          {currentStep === 2 && (
            <div>
              <h3 className="section-title">
                <FiEye />
                Preview Your Template
              </h3>

              <div className="preview-section">
                <h4 style={{ marginBottom: "1rem", color: "#1f2937" }}>
                  Test with Sample Data
                </h4>
                <div className="preview-variables">
                  {templateData.variables.map((variable, index) => (
                    <div key={index} className="preview-variable">
                      <span className="preview-variable-label">
                        {variable.name}:
                      </span>
                      <input
                        type="text"
                        className="preview-variable-input"
                        value={previewVariables[variable.name] || ""}
                        onChange={(e) =>
                          setPreviewVariables((prev) => ({
                            ...prev,
                            [variable.name]: e.target.value,
                          }))
                        }
                        placeholder={variable.description || variable.name}
                      />
                    </div>
                  ))}
                </div>

                <h4 style={{ marginBottom: "1rem", color: "#1f2937" }}>
                  Generated Output:
                </h4>
                <div className="preview-content">{generatePreview()}</div>
              </div>

              <div
                style={{
                  background: "#f0f9ff",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #bae6fd",
                }}
              >
                <h4 style={{ color: "#0369a1", marginBottom: "0.5rem" }}>
                  Template Summary
                </h4>
                <p>
                  <strong>Name:</strong> {templateData.name}
                </p>
                <p>
                  <strong>Category:</strong> {templateData.category}
                </p>
                <p>
                  <strong>Variables:</strong> {templateData.variables.length}
                </p>
                <p>
                  <strong>Estimated Tokens:</strong> ~
                  {templateData.metadata.estimatedTokens}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="wizard-actions">
          <div>
            {currentStep > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <FiArrowLeft />
                Back
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                className="btn btn-primary"
                disabled={!canProceed()}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
                <FiArrowRight />
              </button>
            ) : (
              <button
                className="btn btn-success"
                disabled={loading || !canProceed()}
                onClick={handleSubmit}
              >
                {loading ? (
                  <FiRefreshCw
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <FiSave />
                )}
                {loading ? "Creating..." : "Create Template"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
