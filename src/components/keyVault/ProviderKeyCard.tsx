import React from 'react';
import {
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bot,
  Brain,
  Search,
  MessageSquare,
  Cloud,
  Zap,
  Key
} from 'lucide-react';
import { ProviderKey } from '../../services/keyVault.service';

interface ProviderKeyCardProps {
  providerKey: ProviderKey;
  onDelete: () => void;
}

const getProviderIcon = (provider: string) => {
  const iconProps = { className: 'h-5 w-5 text-white' };
  switch (provider) {
    case 'openai':
      return <Bot {...iconProps} />;
    case 'anthropic':
      return <Brain {...iconProps} />;
    case 'google':
      return <Search {...iconProps} />;
    case 'cohere':
      return <MessageSquare {...iconProps} />;
    case 'aws-bedrock':
      return <Cloud {...iconProps} />;
    case 'deepseek':
      return <Search {...iconProps} />;
    case 'groq':
      return <Zap {...iconProps} />;
    default:
      return <Key {...iconProps} />;
  }
};

const providerNames: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google AI',
  cohere: 'Cohere',
  'aws-bedrock': 'AWS Bedrock',
  deepseek: 'DeepSeek',
  groq: 'Grok'
};

export const ProviderKeyCard: React.FC<ProviderKeyCardProps> = ({ providerKey, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 hover:border-primary-300/50 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            {getProviderIcon(providerKey.provider)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-display font-bold gradient-text-primary truncate mb-1">
              {providerKey.name}
            </h3>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
              {providerNames[providerKey.provider] || providerKey.provider}
            </p>
            {providerKey.description && (
              <p className="font-body text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-2">
                {providerKey.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {providerKey.isActive ? (
            <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg" title="Active">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg" title="Inactive">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          )}
          <button
            onClick={onDelete}
            className="btn w-8 h-8 rounded-lg glass border border-primary-200/30 shadow-lg backdrop-blur-xl flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
            title="Delete provider key"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="glass p-3 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">API Key:</span>
            <code className="bg-primary-100/50 dark:bg-primary-900/50 px-3 py-1 rounded-lg font-mono text-sm gradient-text-primary">
              {providerKey.maskedKey}
            </code>
          </div>
        </div>

        <div className="glass p-3 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">Created:</span>
            <span className="font-display font-semibold gradient-text-primary text-sm">
              {formatDate(providerKey.createdAt)}
            </span>
          </div>
        </div>

        <div className="glass p-3 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">Last Used:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg">
                <Clock className="h-2 w-2 text-white" />
              </div>
              <span className="font-display font-semibold gradient-text-primary text-sm">
                {formatDate(providerKey.lastUsed)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-primary-200/30">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-display font-semibold text-sm ${providerKey.isActive
            ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
            : 'bg-gradient-warning/20 text-warning-700 dark:text-warning-300'
            }`}>
            {providerKey.isActive ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                Inactive
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-secondary flex items-center justify-center shadow-lg">
              <Key className="h-3 w-3 text-white" />
            </div>
            <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Master Key
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};