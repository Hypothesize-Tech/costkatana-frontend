import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Cog6ToothIcon,
    LinkIcon,
    XMarkIcon,
    LightBulbIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import linearIcon from '../../assets/linear-app-icon-seeklogo.svg';
import jiraIcon from '../../assets/jira.png';

interface IntegrationMentionHintProps {
    variant?: 'prominent' | 'compact';
    onDismiss?: () => void;
}

const STORAGE_KEY = 'integration_mention_hint_dismissed';
const STORAGE_DATE_KEY = 'integration_mention_hint_dismissed_date';
const REMINDER_DAYS = 7;

export const IntegrationMentionHint: React.FC<IntegrationMentionHintProps> = ({
    variant = 'prominent',
    onDismiss
}) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [showDontShowAgain, setShowDontShowAgain] = useState(false);
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Integration icons mapping
    const integrationIcons = {
        'JIRA': (
            <img src={jiraIcon} alt="JIRA" className="w-4 h-4 object-contain" />
        ),
        'Linear': (
            <img src={linearIcon} alt="Linear" className="w-4 h-4 object-contain" />
        ),
        'Slack': (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
        ),
        'Discord': (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
        ),
        'GitHub': (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        ),
        'Google Workspace': (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
        ),
        'MongoDB': (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fillRule="evenodd" clipRule="evenodd" fill="#439934" d="M88.038 42.812c1.605 4.643 2.761 9.383 3.141 14.296.472 6.095.256 12.147-1.029 18.142-.035.165-.109.32-.164.48-.403.001-.814-.049-1.208.012-3.329.523-6.655 1.065-9.981 1.604-3.438.557-6.881 1.092-10.313 1.687-1.216.21-2.721-.041-3.212 1.641-.014.046-.154.054-.235.08l.166-10.051-.169-24.252 1.602-.275c2.62-.429 5.24-.864 7.862-1.281 3.129-.497 6.261-.98 9.392-1.465 1.381-.215 2.764-.412 4.148-.618z" /><path fillRule="evenodd" clipRule="evenodd" fill="#45A538" d="M61.729 110.054c-1.69-1.453-3.439-2.842-5.059-4.37-8.717-8.222-15.093-17.899-18.233-29.566-.865-3.211-1.442-6.474-1.627-9.792-.13-2.322-.318-4.665-.154-6.975.437-6.144 1.325-12.229 3.127-18.147l.099-.138c.175.233.427.439.516.702 1.759 5.18 3.505 10.364 5.242 15.551 5.458 16.3 10.909 32.604 16.376 48.9.107.318.384.579.583.866l-.87 2.969z" /><path fillRule="evenodd" clipRule="evenodd" fill="#46A037" d="M88.038 42.812c-1.384.206-2.768.403-4.149.616-3.131.485-6.263.968-9.392 1.465-2.622.417-5.242.852-7.862 1.281l-1.602.275-.012-1.045c-.053-.859-.144-1.717-.154-2.576-.069-5.478-.112-10.956-.18-16.434-.042-3.429-.105-6.857-.175-10.285-.043-2.13-.089-4.261-.185-6.388-.052-1.143-.236-2.28-.311-3.423-.042-.657.016-1.319.029-1.979.817 1.583 1.616 3.178 2.456 4.749 1.327 2.484 3.441 4.314 5.344 6.311 7.523 7.892 12.864 17.068 16.193 27.433z" /><path fillRule="evenodd" clipRule="evenodd" fill="#409433" d="M65.036 80.753c.081-.026.222-.034.235-.08.491-1.682 1.996-1.431 3.212-1.641 3.432-.594 6.875-1.13 10.313-1.687 3.326-.539 6.652-1.081 9.981-1.604.394-.062.805-.011 1.208-.012-.622 2.22-1.112 4.488-1.901 6.647-.896 2.449-1.98 4.839-3.131 7.182a49.142 49.142 0 01-6.353 9.763c-1.919 2.308-4.058 4.441-6.202 6.548-1.185 1.165-2.582 2.114-3.882 3.161l-.337-.23-1.214-1.038-1.256-2.753a41.402 41.402 0 01-1.394-9.838l.023-.561.171-2.426c.057-.828.133-1.655.168-2.485.129-2.982.241-5.964.359-8.946z" /><path fillRule="evenodd" clipRule="evenodd" fill="#4FAA41" d="M65.036 80.753c-.118 2.982-.23 5.964-.357 8.947-.035.83-.111 1.657-.168 2.485l-.765.289c-1.699-5.002-3.399-9.951-5.062-14.913-2.75-8.209-5.467-16.431-8.213-24.642a4498.887 4498.887 0 00-6.7-19.867c-.105-.31-.407-.552-.617-.826l4.896-9.002c.168.292.39.565.496.879a6167.476 6167.476 0 016.768 20.118c2.916 8.73 5.814 17.467 8.728 26.198.116.349.308.671.491 1.062l.67-.78-.167 10.052z" /><path fillRule="evenodd" clipRule="evenodd" fill="#4AA73C" d="M43.155 32.227c.21.274.511.516.617.826a4498.887 4498.887 0 016.7 19.867c2.746 8.211 5.463 16.433 8.213 24.642 1.662 4.961 3.362 9.911 5.062 14.913l.765-.289-.171 2.426-.155.559c-.266 2.656-.49 5.318-.814 7.968-.163 1.328-.509 2.632-.772 3.947-.198-.287-.476-.548-.583-.866-5.467-16.297-10.918-32.6-16.376-48.9a3888.972 3888.972 0 00-5.242-15.551c-.089-.263-.34-.469-.516-.702l3.272-8.84z" /><path fillRule="evenodd" clipRule="evenodd" fill="#57AE47" d="M65.202 70.702l-.67.78c-.183-.391-.375-.714-.491-1.062-2.913-8.731-5.812-17.468-8.728-26.198a6167.476 6167.476 0 00-6.768-20.118c-.105-.314-.327-.588-.496-.879l6.055-7.965c.191.255.463.482.562.769 1.681 4.921 3.347 9.848 5.003 14.778 1.547 4.604 3.071 9.215 4.636 13.813.105.308.47.526.714.786l.012 1.045c.058 8.082.115 16.167.171 24.251z" /><path fillRule="evenodd" clipRule="evenodd" fill="#60B24F" d="M65.021 45.404c-.244-.26-.609-.478-.714-.786-1.565-4.598-3.089-9.209-4.636-13.813-1.656-4.93-3.322-9.856-5.003-14.778-.099-.287-.371-.514-.562-.769 1.969-1.928 3.877-3.925 5.925-5.764 1.821-1.634 3.285-3.386 3.352-5.968.003-.107.059-.214.145-.514l.519 1.306c-.013.661-.072 1.322-.029 1.979.075 1.143.259 2.28.311 3.423.096 2.127.142 4.258.185 6.388.069 3.428.132 6.856.175 10.285.067 5.478.111 10.956.18 16.434.008.861.098 1.718.152 2.577z" /><path fillRule="evenodd" clipRule="evenodd" fill="#A9AA88" d="M62.598 107.085c.263-1.315.609-2.62.772-3.947.325-2.649.548-5.312.814-7.968l.066-.01.066.011a41.402 41.402 0 001.394 9.838c-.176.232-.425.439-.518.701-.727 2.05-1.412 4.116-2.143 6.166-.1.28-.378.498-.574.744l-.747-2.566.87-2.969z" /><path fillRule="evenodd" clipRule="evenodd" fill="#B6B598" d="M62.476 112.621c.196-.246.475-.464.574-.744.731-2.05 1.417-4.115 2.143-6.166.093-.262.341-.469.518-.701l1.255 2.754c-.248.352-.59.669-.728 1.061l-2.404 7.059c-.099.283-.437.483-.663.722l-.695-3.985z" /><path fillRule="evenodd" clipRule="evenodd" fill="#C2C1A7" d="M63.171 116.605c.227-.238.564-.439.663-.722l2.404-7.059c.137-.391.48-.709.728-1.061l1.215 1.037c-.587.58-.913 1.25-.717 2.097l-.369 1.208c-.168.207-.411.387-.494.624-.839 2.403-1.64 4.819-2.485 7.222-.107.305-.404.544-.614.812-.109-1.387-.22-2.771-.331-4.158z" /><path fillRule="evenodd" clipRule="evenodd" fill="#CECDB7" d="M63.503 120.763c.209-.269.506-.508.614-.812.845-2.402 1.646-4.818 2.485-7.222.083-.236.325-.417.494-.624l-.509 5.545c-.136.157-.333.294-.398.477-.575 1.614-1.117 3.24-1.694 4.854-.119.333-.347.627-.525.938-.158-.207-.441-.407-.454-.623-.051-.841-.016-1.688-.013-2.533z" /><path fillRule="evenodd" clipRule="evenodd" fill="#DBDAC7" d="M63.969 123.919c.178-.312.406-.606.525-.938.578-1.613 1.119-3.239 1.694-4.854.065-.183.263-.319.398-.477l.012 3.64-1.218 3.124-1.411-.495z" /><path fillRule="evenodd" clipRule="evenodd" fill="#EBE9DC" d="M65.38 124.415l1.218-3.124.251 3.696-1.469-.572z" /><path fillRule="evenodd" clipRule="evenodd" fill="#CECDB7" d="M67.464 110.898c-.196-.847.129-1.518.717-2.097l.337.23-1.054 1.867z" /><path fillRule="evenodd" clipRule="evenodd" fill="#4FAA41" d="M64.316 95.172l-.066-.011-.066.01.155-.559-.023.56z" /></svg>
        ),
        'AWS': (
            <img
                src={theme === 'dark' ? '/assets/aws-logo.svg' : '/assets/aws-logo.svg'}
                alt="AWS"
                className="w-4 h-4 object-contain"
            />
        ),
        'Webhooks': (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    };

    useEffect(() => {
        // Check if hint was dismissed
        const dismissedDate = localStorage.getItem(STORAGE_DATE_KEY);
        if (dismissedDate) {
            const daysSinceDismissed = Math.floor(
                (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24)
            );
            // Show again after REMINDER_DAYS
            if (daysSinceDismissed < REMINDER_DAYS) {
                setIsDismissed(true);
            } else {
                // Clear old dismissal
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(STORAGE_DATE_KEY);
            }
        } else {
            const dismissed = localStorage.getItem(STORAGE_KEY);
            if (dismissed === 'true') {
                setIsDismissed(true);
            }
        }
    }, []);

    const handleDismiss = (permanent: boolean = false) => {
        setIsDismissed(true);
        if (permanent) {
            localStorage.setItem(STORAGE_KEY, 'true');
            localStorage.setItem(STORAGE_DATE_KEY, Date.now().toString());
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    if (isDismissed) {
        return null;
    }

    if (variant === 'compact') {
        return (
            <div className="mb-2 px-4 py-2 glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <LightBulbIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-secondary-900 dark:text-white truncate">
                        Type <span className="font-semibold text-primary-600 dark:text-primary-400">@</span> to manage integrations directly in chat
                    </span>
                </div>
                <button
                    onClick={() => handleDismiss(false)}
                    className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors flex-shrink-0"
                    title="Dismiss"
                >
                    <XMarkIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </button>
            </div>
        );
    }

    // Prominent variant
    return (
        <div className="mb-8 glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-br from-primary-50/80 via-primary-100/60 to-white/80 dark:from-primary-900/30 dark:via-primary-800/20 dark:to-dark-card/50 shadow-xl backdrop-blur-xl overflow-hidden animate-fade-in">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg glow-primary">
                            <LinkIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg text-secondary-900 dark:text-white mb-1">
                                Manage Integrations in Chat
                            </h3>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                                Use @ mentions to interact with JIRA, Linear, Slack, Discord, and more
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDontShowAgain(true)}
                        className="p-1.5 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors flex-shrink-0"
                        title="Dismiss"
                    >
                        <XMarkIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </button>
                </div>

                {/* Example Usage */}
                <div className="mb-4 p-4 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-100/50 dark:border-primary-800/50">
                    <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider mb-2">
                        Example Usage
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex-shrink-0">
                                {integrationIcons['JIRA']}
                            </div>
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @jira:project:PROJ-123 create issue
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Create JIRA issues</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex-shrink-0">
                                {integrationIcons['Linear']}
                            </div>
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @linear:team:ENG:issues list all
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">List Linear issues</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex-shrink-0 text-primary-500">
                                {integrationIcons['Discord']}
                            </div>
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @discord:list-channels
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Manage Discord server</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex-shrink-0 text-primary-500">
                                {integrationIcons['Discord']}
                            </div>
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @discord create role "VIP"
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Create Discord roles</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex-shrink-0 text-primary-500">
                                {integrationIcons['Slack']}
                            </div>
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @slack:channel:general send alert
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Send Slack messages</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex-shrink-0">
                                {integrationIcons['Google Workspace']}
                            </div>
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @google export to sheets
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Export to Google Sheets</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 flex-shrink-0">
                                {integrationIcons['MongoDB']}
                            </div>
                            <code className="px-2 py-1 rounded bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-mono">
                                @mongodb list all collections
                            </code>
                            <span className="text-xs text-secondary-600 dark:text-secondary-400">Query MongoDB databases</span>
                        </div>
                    </div>
                </div>

                {/* Available Integrations */}
                <div className="mb-4">
                    <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider mb-2">
                        Available Integrations
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['JIRA', 'Linear', 'Slack', 'Discord', 'GitHub', 'Google Workspace', 'MongoDB', 'AWS', 'Webhooks'].map((integration) => (
                            <div
                                key={integration}
                                className="px-2.5 py-1.5 rounded-lg bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-500/20 flex items-center gap-1.5 flex-shrink-0"
                            >
                                <div className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center text-primary-500">
                                    {integrationIcons[integration as keyof typeof integrationIcons] || (
                                        <Cog6ToothIcon className="w-3.5 h-3.5 text-primary-500" />
                                    )}
                                </div>
                                <span className="text-xs font-medium text-secondary-900 dark:text-white whitespace-nowrap">
                                    {integration}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => navigate('/integrations')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-lg font-display font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl glow-primary"
                    >
                        <span>Setup Integrations</span>
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                    {showDontShowAgain && (
                        <button
                            onClick={() => handleDismiss(true)}
                            className="px-3 py-2 text-xs text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white transition-colors"
                        >
                            Don't show again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

