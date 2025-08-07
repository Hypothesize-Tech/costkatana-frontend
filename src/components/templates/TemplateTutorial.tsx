import React, { useState } from "react";
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
  FiHome,
  FiCode,
} from "react-icons/fi";

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
  type: "info" | "interactive" | "demo" | "completion";
  estimatedTime: number; // in minutes
}

export const TemplateTutorial: React.FC<TemplateTutorialProps> = ({
  onClose,
  onCreateTemplate,
  onViewMarketplace,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [userInput, setUserInput] = useState({
    samplePrompt: "",
    variables: [""],
    useCase: "",
  });

  const tutorialSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Welcome to Template Mastery",
      description: "Learn how to create powerful, reusable prompt templates",
      type: "info",
      estimatedTime: 1,
      content: (
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <FiZap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Master Template Creation
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              In the next 10 minutes, you'll learn how to create templates that
              save time, reduce costs, and improve consistency in your AI
              interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Save Money
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Reduce AI costs by up to 75% with optimized prompts
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <FiClock className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Save Time
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Reuse proven prompts instead of writing from scratch
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <FiTarget className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Better Results
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Get consistent, high-quality outputs every time
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "what-are-templates",
      title: "What Are Prompt Templates?",
      description: "Understanding the basics of prompt templates",
      type: "demo",
      estimatedTime: 2,
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
              <h4 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
                ❌ Without Templates
              </h4>
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500 font-mono text-sm">
                  <p>Write a blog post about React hooks for developers</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500 font-mono text-sm">
                  <p>Write a blog post about Vue composition API for developers</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500 font-mono text-sm">
                  <p>Write a blog post about Angular signals for developers</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <span>• Repetitive writing</span>
                </div>
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <span>• Inconsistent quality</span>
                </div>
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <span>• More tokens = Higher cost</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
              <h4 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                ✅ With Templates
              </h4>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-green-500 font-mono text-sm mb-4">
                <p>
                  Write a blog post about{" "}
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-semibold">
                    {"{{topic}}"}
                  </span>{" "}
                  for{" "}
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-semibold">
                    {"{{audience}}"}
                  </span>
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <span>• Write once, use many times</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <span>• Consistent structure</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <span>• Optimized for efficiency</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiArrowRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Key Concept: Variables
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Templates use variables like{" "}
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-sm">
                    {"{{topic}}"}
                  </code>{" "}
                  and{" "}
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-sm">
                    {"{{audience}}"}
                  </code>{" "}
                  that can be filled in with different values each time you use
                  the template.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "identify-use-case",
      title: "Identify Your Use Case",
      description: "Choose what type of template you want to create",
      type: "interactive",
      estimatedTime: 2,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              What do you want to create templates for?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select the use case that best matches your needs:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "content",
                title: "Content Creation",
                description: "Blog posts, articles, social media content",
                example: "Blog post templates, email campaigns, product descriptions",
                icon: FiEdit3,
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
                borderColor: "border-green-200",
              },
              {
                id: "code",
                title: "Code & Documentation",
                description: "API docs, code comments, technical writing",
                example: "API documentation, code reviews, README files",
                icon: FiCode,
                color: "from-blue-500 to-indigo-500",
                bgColor: "from-blue-50 to-indigo-50",
                borderColor: "border-blue-200",
              },
              {
                id: "analysis",
                title: "Data Analysis",
                description: "Reports, insights, business intelligence",
                example: "Performance reports, data summaries, trend analysis",
                icon: FiTarget,
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
                borderColor: "border-purple-200",
              },
              {
                id: "other",
                title: "Something Else",
                description: "Custom use case or mixed purposes",
                example: "Meeting summaries, creative writing, brainstorming",
                icon: FiArrowRight,
                color: "from-gray-500 to-slate-500",
                bgColor: "from-gray-50 to-slate-50",
                borderColor: "border-gray-200",
              },
            ].map((useCase) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={useCase.id}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 ${userInput.useCase === useCase.id
                    ? `bg-gradient-to-br ${useCase.bgColor} ${useCase.borderColor} dark:from-gray-800 dark:to-gray-700 dark:border-gray-600`
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  onClick={() =>
                    setUserInput((prev) => ({ ...prev, useCase: useCase.id }))
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${useCase.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {useCase.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {useCase.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                        Examples: {useCase.example}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "write-first-prompt",
      title: "Write Your First Template",
      description: "Create a simple template with variables",
      type: "interactive",
      estimatedTime: 3,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Let's create your first template
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Write a prompt that you use often, but replace specific values with
              variables.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white">
              Your Template Content:
            </label>
            <textarea
              className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              value={userInput.samplePrompt}
              onChange={(e) =>
                setUserInput((prev) => ({
                  ...prev,
                  samplePrompt: e.target.value,
                }))
              }
              placeholder="Example: Write a professional email to {{recipient}} about {{subject}} with a {{tone}} tone..."
              rows={6}
            />
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                💡 Tips for great templates:
              </h4>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>
                    Use <code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">{"{{variable_name}}"}</code> for values that change
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Be specific about format and style requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Include context and examples when helpful</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Keep it clear and concise</span>
                </li>
              </ul>
            </div>
          </div>

          {userInput.samplePrompt && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Live Preview:
              </h4>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 font-mono text-sm mb-4">
                {userInput.samplePrompt}
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  Detected Variables:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {(userInput.samplePrompt.match(/\{\{([^}]+)\}\}/g) || []).map(
                    (variable, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-mono"
                      >
                        {variable}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "test-template",
      title: "Test Your Template",
      description: "See how variables work in practice",
      type: "demo",
      estimatedTime: 2,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Let's test your template
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fill in the variables to see how your template works:
            </p>
          </div>

          {userInput.samplePrompt ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(userInput.samplePrompt.match(/\{\{([^}]+)\}\}/g) || []).map(
                  (variable, index) => {
                    const varName = variable.replace(/[{}]/g, "");
                    return (
                      <div key={index} className="space-y-2">
                        <label className="block font-medium text-gray-900 dark:text-white">
                          {varName}:
                        </label>
                        <input
                          type="text"
                          placeholder={`Enter ${varName}`}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    );
                  },
                )}
              </div>

              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4">
                  Generated Output:
                </h4>
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-green-200 dark:border-green-700 font-mono text-sm">
                  {userInput.samplePrompt}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No template created yet. Go back to the previous step to create
                one!
              </p>
            </div>
          )}

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
              🎯 Testing Best Practices:
            </h4>
            <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Try different values to ensure flexibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Check that the output makes sense</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Verify all variables are properly replaced</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Test edge cases (long/short values, special characters)</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "save-and-organize",
      title: "Save & Organize Templates",
      description: "Learn how to save and categorize your templates",
      type: "info",
      estimatedTime: 1,
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Organizing Your Templates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                📁 Categorization
              </h4>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                Use categories to group similar templates:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                  Coding
                </span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                  Writing
                </span>
                <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">
                  Analysis
                </span>
                <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium">
                  Creative
                </span>
                <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-medium">
                  Business
                </span>
              </div>
            </div>

            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                🏷️ Tags
              </h4>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Add descriptive tags for easy searching:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  email
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  documentation
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  seo
                </span>
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  reports
                </span>
              </div>
            </div>

            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                📝 Descriptions
              </h4>
              <p className="text-purple-700 dark:text-purple-300">
                Write clear descriptions explaining when to use each template.
              </p>
            </div>

            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                ⭐ Favorites
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300">
                Mark frequently used templates as favorites for quick access.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "completion",
      title: "Congratulations!",
      description: "You've mastered template creation",
      type: "completion",
      estimatedTime: 1,
      content: (
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <FiCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              You're Now a Template Master! 🎉
            </h2>
          </div>

          <div className="text-left space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What you've learned:
              </h3>
              <div className="space-y-3">
                {[
                  "Understanding prompt templates and variables",
                  "Identifying the right use cases for templates",
                  "Creating your first template with variables",
                  "Testing and validating template functionality",
                  "Best practices for organizing templates",
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      {achievement}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What's Next?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                  onClick={onCreateTemplate}
                >
                  <FiZap className="w-5 h-5" />
                  Create Your First Real Template
                </button>
                <button
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                  onClick={onViewMarketplace}
                >
                  <FiEye className="w-5 h-5" />
                  Explore Template Marketplace
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Potential Savings:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-green-800 dark:text-green-200 text-lg">
                      $50-200/month
                    </div>
                    <div className="text-green-700 dark:text-green-300 text-sm">
                      Typical cost savings with templates
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiClock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-800 dark:text-blue-200 text-lg">
                      5-15 hours/week
                    </div>
                    <div className="text-blue-700 dark:text-blue-300 text-sm">
                      Time saved on prompt writing
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
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
      case "identify-use-case":
        return userInput.useCase !== "";
      case "write-first-prompt":
        // More lenient validation - just require some content
        return userInput.samplePrompt.trim().length > 10;
      default:
        return true;
    }
  };

  const totalTime = tutorialSteps.reduce(
    (sum, step) => sum + step.estimatedTime,
    0,
  );
  const completedTime = tutorialSteps
    .slice(0, currentStep + 1)
    .reduce((sum, step) => sum + step.estimatedTime, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{currentStepData.title}</h1>
            <p className="text-blue-100">{currentStepData.description}</p>
          </div>

          <div className="flex justify-between items-center text-sm text-blue-100 mb-4">
            <span>
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <span>
              {completedTime} / {totalTime} min
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${completedSteps.has(index)
                  ? "bg-green-400 scale-125"
                  : index === currentStep
                    ? "bg-white scale-150"
                    : "bg-white/30"
                  }`}
              />
            ))}
          </div>

          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600"
            >
              <FiSkipBack className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep === tutorialSteps.length - 1 ? (
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                >
                  <FiHome className="w-4 h-4" />
                  Finish Tutorial
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Next
                  <FiSkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
