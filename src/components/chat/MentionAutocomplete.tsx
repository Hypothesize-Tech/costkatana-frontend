import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    Cog6ToothIcon,
    ChevronRightIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { parseMention, ParsedMention, VALID_INTEGRATIONS } from '@/utils/integrationMentionParser';
import { integrationService } from '@/services/integration.service';
import googleService, { GoogleConnection } from '@/services/google.service';
import vercelService from '@/services/vercel.service';
import type { Integration } from '@/types/integration.types';
import linearIcon from '@/assets/linear-app-icon-seeklogo.svg';
import jiraIcon from '@/assets/jira.png';
import googleDriveLogo from '@/assets/google-drive-logo.webp';
import googleSheetsLogo from '@/assets/google-sheets-logo.webp';
import googleDocsLogo from '@/assets/google-docs-logo.webp';

interface MentionAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (mention: ParsedMention) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    position?: { top: number; left: number };
}

interface AutocompleteItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    type: 'integration' | 'command' | 'entity' | 'subentity';
    integration?: string;
    command?: string;
    entityType?: string;
    entityId?: string;
    subEntityType?: string;
    data?: Record<string, unknown>;
}

export const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({
    value,
    onChange,
    onSelect,
    textareaRef,
    position
}) => {
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteItems, setAutocompleteItems] = useState<AutocompleteItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentMention, setCurrentMention] = useState<ParsedMention | null>(null);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [googleConnections, setGoogleConnections] = useState<GoogleConnection[]>([]);
    const [vercelConnected, setVercelConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);


    // Load integrations on mount
    useEffect(() => {
        loadIntegrations();
        loadGoogleConnections();
        loadVercelConnection();
    }, []);

    const loadIntegrations = async () => {
        try {
            // Also try without filter to see all integrations
            const response = await integrationService.getIntegrations();

            if (response.success && response.data) {
                setIntegrations(response.data);
            }
        } catch (error) {
            // Silently fail - integrations will just be empty
        }
    };

    const loadGoogleConnections = async () => {
        try {
            const connections = await googleService.listConnections();
            setGoogleConnections(connections.filter(c => c.isActive));
        } catch (error) {
            // Silently fail - Google connections will just be empty
        }
    };

    const loadVercelConnection = async () => {
        try {
            const connections = await vercelService.listConnections();
            setVercelConnected(connections.length > 0 && connections[0].isActive);
        } catch (error) {
            // Silently fail - Vercel connection will just be false
        }
    };

    // Map integration type to integration name
    const getIntegrationNameFromType = useCallback((type: string): string | null => {
        const mapping: Record<string, string> = {
            'linear_oauth': 'linear',
            'jira_oauth': 'jira',
            'slack_oauth': 'slack',
            'discord_oauth': 'discord',
            'github_oauth': 'github',
            'google_oauth': 'google',
            'slack_webhook': 'slack',
            'discord_webhook': 'discord',
            'custom_webhook': 'webhook'
        };
        return mapping[type] || null;
    }, []);

    const getIntegrationIcon = useCallback((integrationName: string): React.ReactNode => {
        switch (integrationName.toLowerCase()) {
            case 'linear':
                return <img src={linearIcon} alt="Linear" className="w-5 h-5" />;
            case 'jira':
                return <img src={jiraIcon} alt="JIRA" className="w-5 h-5" />;
            case 'slack':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                    </svg>
                );
            case 'discord':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                );
            case 'github':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                );
            case 'vercel':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 19.5h20L12 2z" />
                    </svg>
                );
            case 'drive':
                return <img src={googleDriveLogo} alt="Google Drive" className="w-5 h-5" />;
            case 'sheets':
                return <img src={googleSheetsLogo} alt="Google Sheets" className="w-5 h-5" />;
            case 'gdocs':
                return <img src={googleDocsLogo} alt="Google Docs" className="w-5 h-5" />;
            case 'google':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                );
            case 'webhook':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                );
            default:
                return <Cog6ToothIcon className="w-5 h-5 text-primary-500" />;
        }
    }, []);

    // Get list of connected integration names (only active integrations)
    const getConnectedIntegrations = useCallback((): Array<typeof VALID_INTEGRATIONS[number]> => {
        const connectedNames = new Set<string>();

        // Check regular integrations
        integrations.forEach(integration => {
            // Only include active integrations
            if (integration.status === 'active') {
                const name = getIntegrationNameFromType(integration.type);
                if (name && VALID_INTEGRATIONS.includes(name as typeof VALID_INTEGRATIONS[number])) {
                    connectedNames.add(name);
                }
            }
        });

        // Check Google connections separately
        if (googleConnections.length > 0) {
            connectedNames.add('google');
            connectedNames.add('drive');
            connectedNames.add('sheets');
            connectedNames.add('docs');
        }

        // Check Vercel connection
        if (vercelConnected) {
            connectedNames.add('vercel');
        }

        return Array.from(connectedNames) as Array<typeof VALID_INTEGRATIONS[number]>;
    }, [integrations, googleConnections, vercelConnected, getIntegrationNameFromType]);

    const showIntegrationList = useCallback((filter?: string) => {
        // Only show integrations that the user has connected
        let filteredIntegrations = getConnectedIntegrations();

        if (filter) {
            const lowerFilter = filter.toLowerCase();
            filteredIntegrations = filteredIntegrations.filter(integration =>
                integration.toLowerCase().includes(lowerFilter)
            );
        }

        const items: AutocompleteItem[] = filteredIntegrations.map(integration => ({
            id: integration,
            label: integration.charAt(0).toUpperCase() + integration.slice(1),
            type: 'integration',
            integration,
            icon: getIntegrationIcon(integration)
        }));

        setAutocompleteItems(items);
        setSelectedIndex(0);
    }, [getConnectedIntegrations, getIntegrationIcon]);

    // Detect @ mentions and show autocomplete
    useEffect(() => {
        if (!textareaRef.current) return;

        // If autocomplete is explicitly closed, don't reopen unless we detect a new @
        if (!showAutocomplete && !value.includes('@')) {
            setShowAutocomplete(false);
            setCurrentMention(null);
            return;
        }

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const textAfterCursor = value.substring(cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex === -1) {
            setShowAutocomplete(false);
            setCurrentMention(null);
            return;
        }

        // ROOT LEVEL FIX: Check if there's a complete command pattern before processing
        // Get the text from @ to cursor or to next space/newline (whichever comes first)
        const textFromAt = textBeforeCursor.substring(lastAtIndex);
        const spaceAfterAt = textFromAt.indexOf(' ', 1); // Find space after @
        const newlineAfterAt = textFromAt.indexOf('\n', 1); // Find newline after @
        const endOfPotentialCommand = spaceAfterAt > 0 && newlineAfterAt > 0
            ? Math.min(spaceAfterAt, newlineAfterAt)
            : spaceAfterAt > 0 ? spaceAfterAt : (newlineAfterAt > 0 ? newlineAfterAt : textFromAt.length);

        const potentialCommandText = textFromAt.substring(1, endOfPotentialCommand); // Remove @

        // Check if this is a complete command pattern: integration:command-with-dash
        const colonInCommand = potentialCommandText.indexOf(':');
        if (colonInCommand > 0) {
            const commandPart = potentialCommandText.substring(colonInCommand + 1);

            // If command part contains a dash, it's a complete command (e.g., create-issue, list-projects)
            // AND cursor is after the complete command, don't show autocomplete
            if (commandPart.includes('-')) {
                // Check if cursor is after the complete command
                const commandEndPos = lastAtIndex + 1 + potentialCommandText.length;
                // Also check if there's a space or newline immediately after the command (including the space we might have added)
                const hasSpaceAfterCommand = spaceAfterAt > 0 && spaceAfterAt <= potentialCommandText.length + 1;
                const isCursorAfterCommand = cursorPos >= commandEndPos;
                const hasSpaceOrNewlineAfter = textAfterCursor.startsWith(' ') || textAfterCursor.startsWith('\n') || textAfterCursor.length === 0;

                // If we have a complete command and cursor is after it (or there's a space/newline), don't show autocomplete
                if (isCursorAfterCommand || hasSpaceOrNewlineAfter || hasSpaceAfterCommand) {
                    setShowAutocomplete(false);
                    setCurrentMention(null);
                    return;
                }
            }
        }

        // Check if we're in a mention
        const mentionText = textBeforeCursor.substring(lastAtIndex + 1, cursorPos);

        // Check if there's whitespace in the mention (means we're past it)
        if (/\s/.test(mentionText)) {
            setShowAutocomplete(false);
            setCurrentMention(null);
            return;
        }

        // Additional check: if we have a complete command (contains dash after colon) - don't show autocomplete
        const colonIndex = mentionText.indexOf(':');
        if (colonIndex > 0) {
            const afterColon = mentionText.substring(colonIndex + 1);
            // If after colon contains a dash, it's a complete command like "list-issues" or "create-issue"
            // Don't show autocomplete for complete commands
            if (afterColon.includes('-')) {
                setShowAutocomplete(false);
                setCurrentMention(null);
                return;
            }
            // If after colon has text but no dash, and there's a space after or we're at end, it's complete
            if (afterColon.length > 0 && (textAfterCursor.startsWith(' ') || textAfterCursor.startsWith('\n') || textAfterCursor.length === 0 || cursorPos === value.length)) {
                setShowAutocomplete(false);
                setCurrentMention(null);
                return;
            }
        }

        const mention = parseMention(`@${mentionText}`, 0);

        // Check if it's a valid parsed mention with entity types
        if (mention && mention.entityType) {
            setCurrentMention(mention);
            updateAutocompleteItems(mention);
            setShowAutocomplete(true);
        } else if (mentionText.length > 0) {
            // Check if we have an integration selected (with or without colon)
            const trimmedText = mentionText.trim();

            // Check for pattern: @integration: or @integration (followed by colon or space or end)
            const colonIndex = trimmedText.indexOf(':');
            const spaceIndex = trimmedText.indexOf(' ');

            let integrationPart = '';
            let commandPart = '';
            if (colonIndex > 0) {
                // Has colon - extract integration part before colon and command after
                integrationPart = trimmedText.substring(0, colonIndex).toLowerCase();
                commandPart = trimmedText.substring(colonIndex + 1).toLowerCase();

                // If command part contains a dash, it's a complete command - don't show autocomplete
                if (commandPart.includes('-') || (commandPart.length > 0 && (textAfterCursor.startsWith(' ') || textAfterCursor.startsWith('\n') || textAfterCursor.length === 0))) {
                    setShowAutocomplete(false);
                    setCurrentMention(null);
                    return;
                }
            } else if (spaceIndex > 0) {
                // Has space - extract integration part before space
                integrationPart = trimmedText.substring(0, spaceIndex).toLowerCase();
            } else {
                // No colon or space - check if it's a valid integration name
                integrationPart = trimmedText.toLowerCase();
            }

            // Check if it's a valid and connected integration
            const isValidIntegration = getConnectedIntegrations().includes(integrationPart as typeof VALID_INTEGRATIONS[number]);

            // Show commands if we have a valid integration followed by colon (or at end of valid integration)
            const hasColon = colonIndex > 0 && colonIndex === integrationPart.length;
            const isAtEndOfIntegration = cursorPos === textBeforeCursor.length &&
                isValidIntegration &&
                integrationPart.length === trimmedText.length;

            if (isValidIntegration && (hasColon || isAtEndOfIntegration)) {
                // Integration selected (with colon or at end), show commands
                setCurrentMention({
                    integration: integrationPart,
                    fullText: `@${integrationPart}${hasColon ? ':' : ''}`,
                    startIndex: lastAtIndex,
                    endIndex: lastAtIndex + integrationPart.length + (hasColon ? 2 : 1)
                } as ParsedMention);
                showCommandsForIntegration(integrationPart);
                setShowAutocomplete(true);
            } else if (integrationPart.length > 0 && !commandPart.includes('-')) {
                // Still typing, show integration list with filtering (only if command is not complete)
                setCurrentMention(null);
                showIntegrationList(integrationPart);
                setShowAutocomplete(true);
            } else {
                setShowAutocomplete(false);
            }
        } else {
            // Just @ typed, show all connected integrations
            setCurrentMention(null);
            const connectedIntegrations = getConnectedIntegrations();

            if (connectedIntegrations.length > 0) {
                showIntegrationList();
                setShowAutocomplete(true);
            } else {
                // No integrations connected - don't show popover
                setAutocompleteItems([]);
                setShowAutocomplete(false);
            }
        }
    }, [value, integrations, showIntegrationList, getConnectedIntegrations, showAutocomplete]);

    // Update cursor position when textarea selection changes
    useEffect(() => {
        const handleSelectionChange = () => {
            if (textareaRef.current) {
                // Trigger re-evaluation of mention detection
                const event = new Event('input', { bubbles: true });
                textareaRef.current.dispatchEvent(event);
            }
        };

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener('selectionchange', handleSelectionChange);
            return () => {
                textarea.removeEventListener('selectionchange', handleSelectionChange);
            };
        }
    }, []);

    const showCommandsForIntegration = (integration: string) => {
        const commands = getCommandsForIntegration(integration);
        const items: AutocompleteItem[] = commands.map(cmd => ({
            id: `${integration}:${cmd.command}`,
            label: cmd.label,
            type: 'command',
            integration,
            command: cmd.command,
            data: cmd
        }));
        setAutocompleteItems(items);
        setSelectedIndex(0);
    };

    const getCommandsForIntegration = (integration: string): Array<{ command: string; label: string; description?: string }> => {
        switch (integration) {
            case 'jira':
                return [
                    { command: 'create-issue', label: 'Create Issue', description: 'Create a new JIRA issue' },
                    { command: 'list-issues', label: 'List Issues', description: 'List all issues in a project' },
                    { command: 'get-issue', label: 'Get Issue', description: 'Get details of a specific issue' },
                    { command: 'update-issue', label: 'Update Issue', description: 'Update an existing issue' },
                    { command: 'add-comment', label: 'Add Comment', description: 'Add a comment to an issue' }
                ];
            case 'linear':
                return [
                    { command: 'create-issue', label: 'Create Issue', description: 'Create a new Linear issue' },
                    { command: 'list-issues', label: 'List Issues', description: 'List all issues in a team' },
                    { command: 'list-projects', label: 'List Projects', description: 'List all projects in a team' },
                    { command: 'list-users', label: 'List Users', description: 'List all users in a team' },
                    { command: 'list-teams', label: 'List Teams', description: 'List all teams in a team' },
                    { command: 'list-channels', label: 'List Channels', description: 'List all channels in a team' },
                    { command: 'list-tags', label: 'List Tags', description: 'List all tags in a team' },
                    { command: 'list-epics', label: 'List Epics', description: 'List all epics in a team' },
                    { command: 'list-iterations', label: 'List Iterations', description: 'List all iterations in a team' },
                    { command: 'list-workflows', label: 'List Workflows', description: 'List all workflows in a team' },
                    { command: 'get-issue', label: 'Get Issue', description: 'Get details of a specific issue' },
                    { command: 'update-issue', label: 'Update Issue', description: 'Update an existing issue' },
                    { command: 'add-comment', label: 'Add Comment', description: 'Add a comment to an issue' }
                ];
            case 'github':
                return [
                    { command: 'create-issue', label: 'Create Issue', description: 'Create a new GitHub issue' },
                    { command: 'create-pr', label: 'Create Pull Request', description: 'Create a new pull request' },
                    { command: 'list-issues', label: 'List Issues', description: 'List all issues in a repository' },
                    { command: 'list-prs', label: 'List Pull Requests', description: 'List all pull requests' },
                    { command: 'get-issue', label: 'Get Issue', description: 'Get details of a specific issue' },
                    { command: 'add-comment', label: 'Add Comment', description: 'Add a comment to an issue or PR' },
                    { command: 'list-branches', label: 'List Branches', description: 'List all branches in a repository' }
                ];
            case 'vercel':
                return [
                    { command: 'list-projects', label: 'List Projects', description: 'List all your Vercel projects' },
                    { command: 'deploy', label: 'Deploy Project', description: 'Trigger a new deployment' },
                    { command: 'list-deployments', label: 'List Deployments', description: 'Show recent deployments' },
                    { command: 'get-logs', label: 'Get Deployment Logs', description: 'View build and runtime logs' },
                    { command: 'rollback', label: 'Rollback Deployment', description: 'Rollback to previous deployment' },
                    { command: 'promote', label: 'Promote to Production', description: 'Promote deployment to production' },
                    { command: 'list-domains', label: 'List Domains', description: 'List all domains for a project' },
                    { command: 'add-domain', label: 'Add Domain', description: 'Add a custom domain' },
                    { command: 'list-env', label: 'List Environment Variables', description: 'Show environment variables' },
                    { command: 'set-env', label: 'Set Environment Variable', description: 'Add or update an env variable' }
                ];
            case 'slack':
                return [
                    { command: 'send-message', label: 'Send Message', description: 'Send a message to a channel' },
                    { command: 'list-channels', label: 'List Channels', description: 'List all channels' },
                    { command: 'list-users', label: 'List Users', description: 'List all users' }
                ];
            case 'discord':
                return [
                    // Channel Management
                    { command: 'list-channels', label: 'List Channels', description: 'List all channels in server' },
                    { command: 'create-channel', label: 'Create Channel', description: 'Create a new channel' },
                    { command: 'delete-channel', label: 'Delete Channel', description: 'Delete a channel' },
                    { command: 'send-message', label: 'Send Message', description: 'Send a message to a channel' },

                    // User Management
                    { command: 'list-users', label: 'List Users', description: 'List all server members' },
                    { command: 'kick-user', label: 'Kick User', description: 'Kick a user from server' },
                    { command: 'ban-user', label: 'Ban User', description: 'Ban a user from server' },
                    { command: 'unban-user', label: 'Unban User', description: 'Unban a user from server' },

                    // Role Management
                    { command: 'list-roles', label: 'List Roles', description: 'List all server roles' },
                    { command: 'create-role', label: 'Create Role', description: 'Create a new role' },
                    { command: 'assign-role', label: 'Assign Role', description: 'Assign role to user' },
                    { command: 'remove-role', label: 'Remove Role', description: 'Remove role from user' }
                ];
            // Google Workspace Services
            case 'drive':
                return [
                    { command: 'select', label: 'Select Files', description: 'Open file picker to select files' },
                    { command: 'list', label: 'List Files', description: 'List accessible files' },
                    { command: 'search', label: 'Search Files', description: 'Search accessible files by name' },
                    { command: 'upload', label: 'Upload File', description: 'Upload a file' },
                    { command: 'share', label: 'Share File', description: 'Share a file with team' },
                    { command: 'folder', label: 'Create Folder', description: 'Create a new folder' },
                    { command: 'delete', label: 'Delete File', description: 'Delete a file or folder' },
                    { command: 'move', label: 'Move File', description: 'Move file to another folder' },
                    { command: 'copy', label: 'Copy File', description: 'Create a copy of a file' },
                    { command: 'rename', label: 'Rename File', description: 'Rename a file or folder' }
                ];

            case 'sheets':
                return [
                    { command: 'select', label: 'Select Spreadsheet', description: 'Open file picker to select sheets' },
                    { command: 'list', label: 'List Sheets', description: 'Show accessible spreadsheets' },
                    { command: 'read', label: 'Read Sheet', description: 'Read spreadsheet data' },
                    { command: 'create', label: 'Create Sheet', description: 'Create a new spreadsheet' },
                    { command: 'export', label: 'Export Data', description: 'Export cost data to Google Sheets' },
                    { command: 'update', label: 'Update Sheet', description: 'Update spreadsheet data' },
                    { command: 'append', label: 'Append Data', description: 'Append rows to spreadsheet' },
                    { command: 'budget', label: 'Budget Tracker', description: 'Create budget tracking sheet' },
                    { command: 'costs', label: 'Cost Analysis', description: 'Export detailed cost analysis' }
                ];

            case 'docs':
            case 'gdocs':
                return [
                    { command: 'select', label: 'Select Document', description: 'Open file picker to select documents' },
                    { command: 'list', label: 'List Documents', description: 'Show accessible documents' },
                    { command: 'read', label: 'Read Document', description: 'Read document content for Q&A' },
                    { command: 'create', label: 'Create Document', description: 'Create a new document' },
                    { command: 'update', label: 'Update Document', description: 'Update existing document' },
                    { command: 'report', label: 'Cost Report', description: 'Generate cost analysis report' },
                    { command: 'summary', label: 'Cost Summary', description: 'Create monthly cost summary' },
                    { command: 'analysis', label: 'Anomaly Analysis', description: 'Document cost anomalies' },
                    { command: 'delete', label: 'Delete Document', description: 'Delete a document' }
                ];
            default:
                return [];
        }
    };

    const updateAutocompleteItems = async (mention: ParsedMention) => {
        setLoading(true);
        try {
            const items: AutocompleteItem[] = [];

            if (!mention.entityType) {
                // Show commands for the integration
                const commands = getCommandsForIntegration(mention.integration);
                items.push(...commands.map(cmd => ({
                    id: `${mention.integration}:${cmd.command}`,
                    label: cmd.label,
                    type: 'command' as const,
                    integration: mention.integration,
                    command: cmd.command,
                    data: cmd
                })));
            } else if (!mention.entityId) {
                // Show entities (projects, teams, channels, etc.)
                const entities = await getEntitiesForType(mention.integration, mention.entityType);
                items.push(...entities.map(e => ({
                    id: `${mention.integration}:${mention.entityType}:${e.id}`,
                    label: e.name,
                    type: 'subentity' as const,
                    integration: mention.integration,
                    entityType: mention.entityType,
                    entityId: e.id,
                    data: e
                })));
            } else if (!mention.subEntityType) {
                // Show sub-entity types
                const subEntityTypes = getSubEntityTypesForEntity(mention.integration, mention.entityType);
                items.push(...subEntityTypes.map(set => ({
                    id: `${mention.integration}:${mention.entityType}:${mention.entityId}:${set.type}`,
                    label: set.label,
                    type: 'subentity' as const,
                    integration: mention.integration,
                    entityType: mention.entityType,
                    entityId: mention.entityId,
                    subEntityType: set.type
                })));
            } else {
                // Show sub-entities (issues, etc.)
                const subEntities = await getSubEntities(mention);
                items.push(...subEntities.map(se => ({
                    id: `${mention.integration}:${mention.entityType}:${mention.entityId}:${mention.subEntityType}:${se.id}`,
                    label: se.name,
                    type: 'subentity' as const,
                    integration: mention.integration,
                    entityType: mention.entityType,
                    entityId: mention.entityId,
                    subEntityType: mention.subEntityType,
                    data: se
                })));
            }

            setAutocompleteItems(items);
            setSelectedIndex(0);
        } catch (error) {
            setAutocompleteItems([]);
        } finally {
            setLoading(false);
        }
    };


    const getSubEntityTypesForEntity = (integration: string, entityType: string): Array<{ type: string; label: string }> => {
        if (integration === 'jira' && entityType === 'project') {
            return [
                { type: 'issues', label: 'Issues' },
                { type: 'issue', label: 'Create Issue' }
            ];
        }
        if (integration === 'linear' && entityType === 'team') {
            return [
                { type: 'issues', label: 'Issues' },
                { type: 'projects', label: 'Projects' }
            ];
        }
        if (integration === 'github' && entityType === 'repository') {
            return [
                { type: 'issues', label: 'Issues' },
                { type: 'pullrequests', label: 'Pull Requests' },
                { type: 'branches', label: 'Branches' },
                { type: 'files', label: 'Files' }
            ];
        }
        return [];
    };

    const getEntitiesForType = async (integration: string, entityType: string): Promise<Array<{ id: string; name: string }>> => {
        try {
            const userIntegrations = integrations.filter(i => {
                if (integration === 'jira') return i.type === 'jira_oauth';
                if (integration === 'linear') return i.type === 'linear_oauth';
                if (integration === 'slack') return i.type === 'slack_oauth';
                if (integration === 'discord') return i.type === 'discord_oauth';
                if (integration === 'github') return i.type === 'github_oauth';
                return false;
            });

            if (userIntegrations.length === 0) {
                return [];
            }

            // Call backend API to get entities
            const entities = await integrationService.listEntities(integration, entityType);
            return entities;
        } catch (error) {
            return [];
        }
    };

    const getSubEntities = async (mention: ParsedMention): Promise<Array<{ id: string; name: string }>> => {
        try {
            if (!mention.entityId) {
                return [];
            }

            // Call backend API to get sub-entities
            const subEntities = await integrationService.getSubEntities(
                mention.integration,
                mention.entityId,
                mention.subEntityType
            );
            return subEntities;
        } catch (error) {
            return [];
        }
    };

    const handleSelect = useCallback((item: AutocompleteItem) => {
        if (!textareaRef.current) return;

        const cursorPos = textareaRef.current.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = value.substring(cursorPos);

        if (item.type === 'integration' && item.integration) {
            // Insert integration name with colon (not space)
            const newText =
                value.substring(0, lastAtIndex + 1) +
                item.integration +
                ':' +
                textAfterCursor;

            onChange(newText);

            // Set current mention and show commands automatically
            const parsedMention: ParsedMention = {
                integration: item.integration,
                fullText: `@${item.integration}:`,
                startIndex: lastAtIndex,
                endIndex: lastAtIndex + item.integration.length + 2
            };
            setCurrentMention(parsedMention);
            showCommandsForIntegration(item.integration);

            // Keep autocomplete open to show commands
            setShowAutocomplete(true);
            return;
        }

        if (item.type === 'command' && currentMention && item.command) {
            // Use the command directly with dashes (e.g., list-issues, create-issue)
            const commandText = item.command;

            // Find the mention pattern in the text: @integration:...
            const colonIndex = textBeforeCursor.indexOf(':', lastAtIndex);

            // Determine what to replace
            // If we have @linear: and cursor is after colon, replace from @ to cursor
            // If we have @linear:something, replace from @ to end of "something"
            const replaceStartIndex = lastAtIndex; // Start from @
            let replaceEndIndex = cursorPos; // Default to cursor position

            if (colonIndex > 0 && colonIndex < cursorPos) {
                // We have a colon, check what comes after it
                const afterColon = textBeforeCursor.substring(colonIndex + 1, cursorPos);

                // If there's text after colon (partial command or other text), replace it too
                if (afterColon.length > 0) {
                    // Replace everything from @ to cursor (including any partial command)
                    replaceEndIndex = cursorPos;
                } else {
                    // No text after colon, just replace from @ to after colon
                    replaceEndIndex = colonIndex + 1;
                }
            }

            // Get text after the replacement point (preserve any text that comes after the mention)
            const textAfterReplace = value.substring(replaceEndIndex);

            // Build new text: everything before @ + @integration:command + space + text after
            const beforeAt = value.substring(0, replaceStartIndex);
            const newText = beforeAt +
                `@${currentMention.integration}:${commandText}` +
                (textAfterReplace.trim() ? ' ' + textAfterReplace.trim() : ' ');

            onChange(newText);

            // Set cursor position after the inserted command
            setTimeout(() => {
                if (textareaRef.current) {
                    const newCursorPos = beforeAt.length +
                        1 + // @
                        currentMention.integration.length + // integration
                        1 + // :
                        commandText.length + // command
                        1; // space
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }
            }, 0);

            // Close autocomplete and clear current mention to prevent reopening
            // The root-level check in useEffect will prevent it from reopening
            setShowAutocomplete(false);
            setCurrentMention(null);

            // Don't call onSelect for commands - it might trigger parent to add another mention
            return;
        }

        if (!currentMention) {
            return;
        }

        // Build mention string
        let mentionText = `@${currentMention.integration}`;
        if (item.entityType) {
            mentionText += `:${item.entityType}`;
        }
        if (item.entityId) {
            mentionText += `:${item.entityId}`;
        }
        if (item.subEntityType) {
            mentionText += `:${item.subEntityType}`;
        }

        const newText =
            value.substring(0, lastAtIndex) +
            mentionText +
            ' ' +
            textAfterCursor;

        onChange(newText);
        setShowAutocomplete(false);

        // Create parsed mention for callback
        const parsedMention: ParsedMention = {
            integration: item.integration || currentMention.integration,
            entityType: item.entityType || currentMention.entityType,
            entityId: item.entityId || currentMention.entityId,
            subEntityType: item.subEntityType,
            fullText: mentionText,
            startIndex: lastAtIndex,
            endIndex: lastAtIndex + mentionText.length
        };

        onSelect(parsedMention);
    }, [currentMention, value, onChange, onSelect, textareaRef]);

    // Keyboard handler for autocomplete - exposed via ref
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!showAutocomplete || autocompleteItems.length === 0) return false;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % autocompleteItems.length);
                return true;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + autocompleteItems.length) % autocompleteItems.length);
                return true;
            case 'Enter':
            case 'Tab':
                if (showAutocomplete && autocompleteItems[selectedIndex]) {
                    e.preventDefault();
                    handleSelect(autocompleteItems[selectedIndex]);
                    return true;
                }
                return false;
            case 'Escape':
                e.preventDefault();
                setShowAutocomplete(false);
                return true;
            default:
                return false;
        }
    }, [showAutocomplete, autocompleteItems, selectedIndex, handleSelect, setSelectedIndex, setShowAutocomplete]);

    // Expose keyboard handler via ref for parent component
    const keyboardHandlerRef = useRef<((e: KeyboardEvent) => boolean) | null>(null);
    keyboardHandlerRef.current = handleKeyDown;

    // Provide handler to parent via custom event or direct access
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const keyDownHandler = (e: KeyboardEvent) => {
            if (keyboardHandlerRef.current && keyboardHandlerRef.current(e)) {
                // Autocomplete handled the event, prevent default behavior
                return;
            }
            // Let parent handle other keys
        };

        textarea.addEventListener('keydown', keyDownHandler);
        return () => {
            textarea.removeEventListener('keydown', keyDownHandler);
        };
    }, [handleKeyDown]);

    // Calculate position relative to textarea - display below the textarea
    useEffect(() => {
        if (!showAutocomplete || !textareaRef.current || autocompleteItems.length === 0) {
            setDropdownPosition(null);
            return;
        }

        const updatePosition = () => {
            if (!textareaRef.current) return;
            const textarea = textareaRef.current;
            const rect = textarea.getBoundingClientRect();
            // Position below the textarea with 8px gap
            setDropdownPosition({
                top: rect.bottom + 8, // 8px below textarea
                left: rect.left
            });
        };

        // Update position after render
        requestAnimationFrame(() => {
            updatePosition();
        });

        // Update on scroll/resize
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [showAutocomplete, autocompleteItems.length]);


    // Render check and conditional return - MUST be after all hooks
    if (!showAutocomplete || autocompleteItems.length === 0 || !dropdownPosition) {
        return null;
    }

    const dropdownContent = (
        <div
            ref={dropdownRef}
            className="fixed w-72 max-h-80 overflow-y-auto glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel z-[9999] animate-scale-in"
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                position: 'fixed',
                visibility: 'visible',
                display: 'block',
                opacity: 1,
                pointerEvents: 'auto',
                zIndex: 9999
            }}
        >
            {loading ? (
                <div className="p-4 text-center text-secondary-600 dark:text-secondary-400">
                    Loading...
                </div>
            ) : (
                <div className="p-2">
                    {autocompleteItems.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={`w-full p-2.5 text-left hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-200 rounded-lg flex items-center justify-between gap-2 ${index === selectedIndex
                                ? 'bg-gradient-primary/10 border border-primary-300 dark:border-primary-600'
                                : 'border border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
                                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                    {item.icon || <Cog6ToothIcon className="w-4 h-4 text-primary-500" />}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                                        {item.label}
                                    </div>
                                    {item.type === 'command' && item.data && 'description' in item.data && typeof item.data.description === 'string' && (
                                        <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate mt-0.5">
                                            {item.data.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center">
                                {index === selectedIndex && (
                                    <CheckIcon className="w-4 h-4 text-primary-500" />
                                )}
                                {item.type !== 'integration' && item.type !== 'command' && !selectedIndex && (
                                    <ChevronRightIcon className="w-4 h-4 text-secondary-400" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // Render dropdown using portal to avoid positioning issues with parent containers
    return createPortal(dropdownContent, document.body);
};

// Export keyboard handler hook for parent component
export const useMentionKeyboard = (
    showAutocomplete: boolean,
    autocompleteItems: AutocompleteItem[],
    selectedIndex: number,
    setSelectedIndex: (index: number | ((prev: number) => number)) => void,
    handleSelect: (item: AutocompleteItem) => void,
    setShowAutocomplete: (show: boolean) => void
) => {
    return useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showAutocomplete || autocompleteItems.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % autocompleteItems.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + autocompleteItems.length) % autocompleteItems.length);
                break;
            case 'Enter':
            case 'Tab':
                if (showAutocomplete && autocompleteItems[selectedIndex]) {
                    e.preventDefault();
                    handleSelect(autocompleteItems[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowAutocomplete(false);
                break;
        }
    }, [showAutocomplete, autocompleteItems, selectedIndex, handleSelect, setShowAutocomplete]);
};
