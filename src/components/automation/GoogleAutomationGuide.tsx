import React, { useState } from 'react';
import {
    DocumentTextIcon,
    TableCellsIcon,
    PresentationChartLineIcon,
    EnvelopeIcon,
    CalendarIcon,
    ClipboardDocumentListIcon,
    SparklesIcon,
    FolderIcon,
    ArrowRightIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export const GoogleAutomationGuide: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'triggers' | 'actions'>('triggers');

    const googleTriggers = [
        {
            id: 'google_sheet_cell_changed',
            name: 'Google Sheet Cell Changed',
            description: 'Trigger when a specific cell or range in a Google Sheet is modified',
            icon: TableCellsIcon,
            example: 'Budget cell updated → Update CostKatana budget',
            config: {
                connectionId: 'string',
                spreadsheetId: 'string',
                range: 'string (e.g., "Budget!B5")',
                watchMode: 'cell | range | sheet'
            }
        },
        {
            id: 'google_form_submitted',
            name: 'Google Form Submitted',
            description: 'Trigger when a Google Form is submitted',
            icon: ClipboardDocumentListIcon,
            example: 'Team feedback form submitted → Create cost optimization task',
            config: {
                connectionId: 'string',
                formId: 'string',
                filterBy: 'optional response filters'
            }
        },
        {
            id: 'google_calendar_event',
            name: 'Google Calendar Event',
            description: 'Trigger on Calendar event start/end',
            icon: CalendarIcon,
            example: 'Budget review meeting starts → Generate cost report',
            config: {
                connectionId: 'string',
                calendarId: 'string',
                eventType: 'start | end | created | updated',
                filterBy: 'optional event filters'
            }
        },
        {
            id: 'gmail_alert_received',
            name: 'Gmail Alert Received',
            description: 'Trigger when Gmail receives a cost alert email',
            icon: EnvelopeIcon,
            example: 'Billing alert email received → Create anomaly investigation',
            config: {
                connectionId: 'string',
                query: 'string (Gmail search query)',
                from: 'optional sender filter',
                subject: 'optional subject filter'
            }
        },
        {
            id: 'google_drive_file_created',
            name: 'Google Drive File Created',
            description: 'Trigger when a file is created in Google Drive',
            icon: FolderIcon,
            example: 'New cost report uploaded → Parse and analyze',
            config: {
                connectionId: 'string',
                folderId: 'optional folder filter',
                mimeType: 'optional file type filter'
            }
        }
    ];

    const googleActions = [
        {
            id: 'create_google_doc',
            name: 'Create Google Doc',
            description: 'Create a new Google Doc with content',
            icon: DocumentTextIcon,
            example: 'Cost anomaly detected → Create investigation doc',
            config: {
                connectionId: 'string',
                title: 'string',
                content: 'string',
                folderId: 'optional folder'
            }
        },
        {
            id: 'update_google_sheet',
            name: 'Update Google Sheet',
            description: 'Update cells in a Google Sheet',
            icon: TableCellsIcon,
            example: 'Budget threshold exceeded → Update Sheet with alert',
            config: {
                connectionId: 'string',
                spreadsheetId: 'string',
                range: 'string (e.g., "Alerts!A1")',
                values: 'array of arrays'
            }
        },
        {
            id: 'send_gmail',
            name: 'Send Gmail',
            description: 'Send an email via Gmail',
            icon: EnvelopeIcon,
            example: 'Cost spike detected → Send alert email',
            config: {
                connectionId: 'string',
                to: 'string or array',
                subject: 'string',
                body: 'string (HTML or plain text)',
                attachments: 'optional file attachments'
            }
        },
        {
            id: 'create_calendar_event',
            name: 'Create Calendar Event',
            description: 'Create a calendar event',
            icon: CalendarIcon,
            example: 'Monthly budget review → Schedule meeting',
            config: {
                connectionId: 'string',
                summary: 'string',
                description: 'string',
                startTime: 'ISO datetime',
                endTime: 'ISO datetime',
                attendees: 'optional email array'
            }
        },
        {
            id: 'create_google_form',
            name: 'Create Google Form',
            description: 'Create a Google Form',
            icon: ClipboardDocumentListIcon,
            example: 'Team survey needed → Create feedback form',
            config: {
                connectionId: 'string',
                title: 'string',
                description: 'string',
                questions: 'array of question objects'
            }
        },
        {
            id: 'create_google_slides',
            name: 'Create Google Slides',
            description: 'Create a Google Slides presentation',
            icon: PresentationChartLineIcon,
            example: 'QBR coming up → Generate cost deck',
            config: {
                connectionId: 'string',
                title: 'string',
                slides: 'array of slide objects'
            }
        },
        {
            id: 'export_to_google_sheets',
            name: 'Export to Google Sheets',
            description: 'Export data to a Google Sheet',
            icon: TableCellsIcon,
            example: 'Cost analysis complete → Export to Sheets',
            config: {
                connectionId: 'string',
                spreadsheetId: 'optional (creates new if not provided)',
                data: 'array of objects',
                template: 'optional template name'
            }
        },
        {
            id: 'export_to_google_docs',
            name: 'Export to Google Docs',
            description: 'Export report to Google Docs',
            icon: DocumentTextIcon,
            example: 'Monthly report ready → Create Doc',
            config: {
                connectionId: 'string',
                title: 'string',
                content: 'string',
                template: 'optional template name'
            }
        },
        {
            id: 'export_to_google_slides',
            name: 'Export to Google Slides',
            description: 'Export data to Google Slides',
            icon: PresentationChartLineIcon,
            example: 'Anomaly analysis → Create presentation',
            config: {
                connectionId: 'string',
                title: 'string',
                slides: 'array of slide objects'
            }
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold font-display gradient-text-primary">
                        Google Workspace Automation
                    </h3>
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">
                    Use Google Workspace products as triggers and actions in your automation workflows
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-primary-200/30 dark:border-primary-500/20">
                <button
                    onClick={() => setActiveSection('triggers')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeSection === 'triggers'
                            ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-secondary-600 dark:text-secondary-300 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                >
                    Triggers ({googleTriggers.length})
                </button>
                <button
                    onClick={() => setActiveSection('actions')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeSection === 'actions'
                            ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-secondary-600 dark:text-secondary-300 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                >
                    Actions ({googleActions.length})
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeSection === 'triggers' && (
                    <>
                        {googleTriggers.map((trigger) => {
                            const Icon = trigger.icon;
                            return (
                                <div
                                    key={trigger.id}
                                    className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                                                {trigger.name}
                                            </h4>
                                            <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-3">
                                                {trigger.description}
                                            </p>
                                            <div className="flex items-start gap-2 mb-3">
                                                <ArrowRightIcon className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-secondary-500 dark:text-secondary-400 italic">
                                                    {trigger.example}
                                                </p>
                                            </div>
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                                                <p className="text-xs font-mono text-secondary-700 dark:text-secondary-300 mb-2">
                                                    Configuration:
                                                </p>
                                                <pre className="text-xs text-secondary-600 dark:text-secondary-400 overflow-x-auto">
                                                    {JSON.stringify(trigger.config, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}

                {activeSection === 'actions' && (
                    <>
                        {googleActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <div
                                    key={action.id}
                                    className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                                                {action.name}
                                            </h4>
                                            <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-3">
                                                {action.description}
                                            </p>
                                            <div className="flex items-start gap-2 mb-3">
                                                <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-secondary-500 dark:text-secondary-400 italic">
                                                    {action.example}
                                                </p>
                                            </div>
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
                                                <p className="text-xs font-mono text-secondary-700 dark:text-secondary-300 mb-2">
                                                    Configuration:
                                                </p>
                                                <pre className="text-xs text-secondary-600 dark:text-secondary-400 overflow-x-auto">
                                                    {JSON.stringify(action.config, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Setup Instructions */}
            <div className="p-4 rounded-lg border border-blue-200/30 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/20">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Setup Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>Connect your Google Workspace account from Settings → Integrations → Google</li>
                    <li>In your automation platform (Zapier, Make, n8n), add CostKatana webhook as a step</li>
                    <li>Use the trigger/action IDs above in your webhook payload</li>
                    <li>Include your Google connectionId in the configuration</li>
                    <li>Test your workflow with sample data</li>
                </ol>
            </div>
        </div>
    );
};

