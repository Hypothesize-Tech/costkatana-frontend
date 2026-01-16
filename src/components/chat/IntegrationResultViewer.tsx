import React, { useState, useCallback } from 'react';
import {
    CodeBracketIcon,
    TableCellsIcon,
    DocumentTextIcon,
    ListBulletIcon,
    Squares2X2Icon,
} from '@heroicons/react/24/outline';

// Import logos
import jiraLogo from '../../assets/jira.png';
import linearLogo from '@/assets/linear-app-icon-seeklogo.svg';

interface IntegrationResultViewerProps {
    data: any;
    integration: string;
    initialViewType?: 'table' | 'json' | 'list' | 'text';
    onViewTypeChange?: (newType: string) => void;
}

const getIntegrationIcon = (integration: string) => {
    const iconClass = 'w-6 h-6';
    
    switch (integration) {
        case 'github':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#06ec9e' }}>
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            );
        case 'vercel':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" style={{ color: '#000000' }}>
                    <path d="M12 2L2 19.5h20L12 2z" fill="currentColor" />
                </svg>
            );
        case 'slack':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#4A154B' }}>
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                </svg>
            );
        case 'discord':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#5865F2' }}>
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            );
        case 'jira':
            return <img src={jiraLogo} alt="Jira" className={iconClass} style={{ objectFit: 'contain' }} />;
        case 'linear':
            return <img src={linearLogo} alt="Linear" className={iconClass} style={{ objectFit: 'contain' }} />;
        case 'google':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
            );
        case 'aws':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" style={{ color: '#FF9900' }}>
                    <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335c-.072.048-.144.072-.2.072-.08 0-.16-.04-.239-.112-.112-.12-.207-.248-.279-.383-.072-.135-.144-.287-.207-.455-.527.623-1.191.934-1.975.934-.559 0-1.007-.16-1.327-.48-.32-.319-.48-.751-.48-1.295 0-.575.2-1.04.607-1.383.407-.344.95-.52 1.647-.52.23 0 .47.016.727.056.255.04.52.088.791.16v-.527c0-.551-.112-.935-.344-1.151-.23-.216-.62-.32-1.167-.32-.255 0-.52.032-.791.08-.272.048-.536.112-.792.2-.119.048-.207.08-.247.096-.04.016-.072.024-.088.024-.08 0-.12-.063-.12-.183v-.295c0-.096.016-.168.056-.2.04-.048.112-.088.2-.127.272-.144.6-.264.983-.36.384-.095.8-.144 1.231-.144.942 0 1.631.215 2.07.647.432.432.65 1.087.65 1.967v2.591zm-2.718 1.027c.22 0 .448-.04.695-.12.247-.08.464-.2.647-.36.112-.095.192-.2.24-.31.047-.112.08-.248.08-.408v-.615c-.2-.064-.415-.112-.647-.144-.23-.032-.464-.048-.695-.048-.495 0-.863.096-1.11.288-.248.192-.368.464-.368.823 0 .336.08.58.256.735.168.16.432.24.792.24l.11-.04zm5.535 1.295c-.104 0-.175-.016-.215-.056-.04-.032-.072-.104-.088-.2l-.991-3.28c-.016-.048-.024-.088-.024-.12 0-.063.032-.104.088-.104h.36c.111 0 .183.016.215.056.04.032.064.104.08.2l.712 2.816.663-2.816c.016-.096.04-.168.08-.2.04-.04.111-.056.215-.056h.295c.104 0 .175.016.215.056.04.032.072.104.088.2l.671 2.848.735-2.848c.016-.096.048-.168.08-.2.04-.04.104-.056.215-.056h.343c.056 0 .088.032.088.104 0 .024-.008.048-.016.08-.008.032-.016.072-.032.12l-1.023 3.28c-.016.096-.048.168-.088.2-.04.04-.111.056-.215.056h-.319c-.104 0-.175-.016-.215-.056-.04-.032-.072-.104-.088-.2l-.655-2.735-.647 2.735c-.016.096-.048.168-.088.2-.04.04-.111.056-.215.056h-.319zm4.02.215c-.287 0-.575-.032-.863-.104-.287-.072-.51-.144-.67-.24-.096-.056-.16-.12-.184-.168-.023-.048-.04-.104-.04-.168v-.304c0-.12.048-.184.128-.184.032 0 .064.008.104.024.04.016.104.048.175.08.247.104.51.184.79.232.287.048.567.072.847.072.448 0 .791-.08 1.039-.24.247-.16.375-.384.375-.67 0-.2-.064-.368-.184-.504-.128-.136-.368-.264-.703-.384l-1.015-.32c-.511-.16-.886-.4-1.118-.71-.23-.312-.35-.67-.35-1.063 0-.304.064-.575.2-.815.135-.24.32-.448.55-.615.23-.168.503-.296.815-.384.32-.088.67-.128 1.047-.128.127 0 .255.008.375.032.128.016.247.048.367.08.112.032.216.072.312.112.096.04.168.088.2.127.048.048.08.088.104.144.024.056.032.12.032.2v.28c0 .12-.048.184-.128.184-.048 0-.127-.024-.207-.064-.335-.152-.71-.232-1.118-.232-.407 0-.727.064-.951.2-.23.135-.34.34-.34.615 0 .2.072.375.207.52.136.144.384.28.744.408l.991.32c.504.16.871.384 1.087.67.216.287.32.623.32 1.015 0 .32-.064.607-.2.863-.135.256-.32.48-.56.655-.239.176-.527.312-.863.408-.336.096-.7.144-1.094.144l-.28-.016z" fill="currentColor"/>
                </svg>
            );
        case 'mongodb':
            return (
                <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                    <path fillRule="evenodd" clipRule="evenodd" fill="#439934" d="M88.038 42.812c1.605 4.643 2.761 9.383 3.141 14.296.472 6.095.256 12.147-1.029 18.142-.035.165-.109.32-.164.48-.403.001-.814-.049-1.208.012-3.329.523-6.655 1.065-9.981 1.604-3.438.557-6.881 1.092-10.313 1.687-1.216.21-2.721-.041-3.212 1.641-.014.046-.154.054-.235.08l.166-10.051-.169-24.252 1.602-.275c2.62-.429 5.24-.864 7.862-1.281 3.129-.497 6.261-.98 9.392-1.465 1.381-.215 2.764-.412 4.148-.618z" />
                    <path fillRule="evenodd" clipRule="evenodd" fill="#45A538" d="M61.729 110.054c-1.69-1.453-3.439-2.842-5.059-4.37-8.717-8.222-15.093-17.899-18.233-29.566-.865-3.211-1.442-6.474-1.627-9.792-.13-2.322-.318-4.665-.154-6.975.437-6.144 1.325-12.229 3.127-18.147l.099-.138c.175.233.427.439.516.702 1.759 5.18 3.505 10.364 5.242 15.551 5.458 16.3 10.909 32.604 16.376 48.9.107.318.384.579.583.866l-.87 2.969z" />
                    <path fillRule="evenodd" clipRule="evenodd" fill="#46A037" d="M88.038 42.812c-1.384.206-2.768.403-4.149.616-3.131.485-6.263.968-9.392 1.465-2.622.417-5.242.852-7.862 1.281l-1.602.275-.012-1.045c-.053-.859-.144-1.717-.154-2.576-.069-5.478-.112-10.956-.18-16.434-.042-3.429-.105-6.857-.175-10.285-.043-2.13-.089-4.261-.185-6.388-.052-1.143-.236-2.28-.311-3.423-.042-.657.016-1.319.029-1.979.817 1.583 1.616 3.178 2.456 4.749 1.327 2.484 3.441 4.314 5.344 6.311 7.523 7.892 12.864 17.068 16.193 27.433z" />
                </svg>
            );
        default:
            return (
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
                    <DocumentTextIcon className="w-4 h-4 text-white" />
                </div>
            );
    }
};

const getIntegrationTitle = (integration: string) => {
    const titles: Record<string, string> = {
        github: 'GitHub',
        vercel: 'Vercel',
        slack: 'Slack',
        discord: 'Discord',
        jira: 'Jira',
        linear: 'Linear',
        google: 'Google',
        aws: 'AWS',
        mongodb: 'MongoDB',
    };
    return titles[integration] || integration.charAt(0).toUpperCase() + integration.slice(1);
};

export const IntegrationResultViewer: React.FC<IntegrationResultViewerProps> = ({
    data,
    integration,
    initialViewType = 'list',
    onViewTypeChange,
}) => {
    const [viewType, setViewType] = useState<'table' | 'json' | 'list' | 'text'>(initialViewType);
    const isMongoDBIntegration = integration === 'mongodb';

    const handleViewTypeChange = useCallback(
        (newType: 'table' | 'json' | 'list' | 'text') => {
            setViewType(newType);
            onViewTypeChange?.(newType);
        },
        [onViewTypeChange]
    );

    const renderListView = (listData: any) => {
        // Handle both array format and object with items property
        const items: any[] = Array.isArray(listData) ? listData : (listData?.items || []);

        if (!items || items.length === 0) {
            return (
                <div className="text-center py-12">
                    <ListBulletIcon className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">No items to display</p>
                </div>
            );
        }

        return (
            <div className="space-y-3 max-h-[600px] overflow-auto p-1">
                {items.map((item: any, index: number) => (
                    <div
                        key={index}
                        className="group relative p-4 bg-white/50 dark:bg-dark-card/30 backdrop-blur-sm rounded-xl border border-primary-200/20 dark:border-primary-500/10 hover:border-primary-400/40 dark:hover:border-primary-400/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5"
                    >
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {item.title}
                        </div>
                        {item.description && (
                            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                {item.description}
                            </div>
                        )}
                        {(item.url || item.html_url) && (
                            <a
                                href={item.url || item.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors group/link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const url = item.url || item.html_url;
                                    if (url) {
                                        // Ensure the URL is absolute
                                        const absoluteUrl = url.startsWith('http') ? url : `https://${url}`;
                                        window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
                                    }
                                }}
                            >
                                <span className="underline decoration-primary-400/50 hover:decoration-primary-500 underline-offset-2">
                                    View on {integration === 'github' ? 'GitHub' : integration.charAt(0).toUpperCase() + integration.slice(1)}
                                </span>
                                <span className="transform transition-transform group-hover/link:translate-x-0.5">→</span>
                            </a>
                        )}
                        {item.metadata && Object.keys(item.metadata).length > 0 && (
                            <div className="mt-3 pt-3 border-t border-primary-200/10 dark:border-primary-500/10">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(item.metadata).map(([key, value]: [string, any]) => (
                                        <div key={key} className="flex justify-between gap-2">
                                            <span className="text-light-text-muted dark:text-dark-text-muted capitalize">{key}:</span>
                                            <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {(listData?.count || items.length) && (
                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted text-center mt-4 pt-4 border-t border-primary-200/10 dark:border-primary-500/10">
                        Total: {listData?.count || items.length} items
                    </div>
                )}
            </div>
        );
    };

    const renderTableView = (tableData: any) => {
        // Handle both direct array and object with items
        const items = Array.isArray(tableData) ? tableData : (tableData?.items || []);

        if (!items || items.length === 0) {
            return (
                <div className="text-center py-12">
                    <TableCellsIcon className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">No data to display</p>
                </div>
            );
        }

        const columns = items.length > 0 ? Object.keys(items[0]) : [];

        return (
            <div className="overflow-x-auto max-h-[600px] rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-950/30 dark:to-transparent backdrop-blur-sm border-b border-primary-200/20 dark:border-primary-500/10">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className="px-4 py-3 text-left font-display font-semibold text-light-text-primary dark:text-dark-text-primary text-xs uppercase tracking-wider"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-200/10 dark:divide-primary-500/10">
                        {items.map((item: any, idx: number) => (
                            <tr
                                key={idx}
                                className="hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-colors"
                            >
                                {columns.map((col) => (
                                    <td key={col} className="px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        {typeof item[col] === 'object'
                                            ? <span className="text-xs font-mono">{JSON.stringify(item[col]).substring(0, 50)}</span>
                                            : String(item[col])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderJsonView = (jsonData: any) => {
        return (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-4 overflow-auto max-h-[600px] border border-primary-200/20 dark:border-primary-500/10">
                <pre className="text-sm text-primary-400 font-mono leading-relaxed" data-message-id="integration-result">
                    {JSON.stringify(jsonData, null, 2)}
                </pre>
            </div>
        );
    };

    const renderContent = () => {
        switch (viewType) {
            case 'table':
                return renderTableView(data);
            case 'json':
                return renderJsonView(data);
            case 'list':
            default:
                return renderListView(data);
        }
    };

    return (
        <div className="mb-6 rounded-2xl overflow-hidden border border-primary-200/20 dark:border-primary-500/10 bg-gradient-to-br from-white/80 to-light-panel/50 dark:from-dark-card/50 dark:to-dark-bg-200/30 backdrop-blur-xl shadow-xl">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {getIntegrationIcon(integration)}
                        <div>
                            <h3 className="font-display font-bold text-light-text-primary dark:text-dark-text-primary text-lg">
                                {getIntegrationTitle(integration)} Results
                            </h3>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
                                Integration response data
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-primary-100/50 dark:bg-primary-900/30 text-xs font-medium text-primary-600 dark:text-primary-400">
                            {Array.isArray(data) ? data.length : data?.items?.length || 0} items
                        </span>
                    </div>
                </div>

                {/* View Type Selector */}
                <div className="flex gap-2 mb-4 p-1 bg-light-bg/50 dark:bg-dark-bg-100/50 rounded-xl">
                    <button
                        onClick={() => handleViewTypeChange('list')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${viewType === 'list'
                            ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/20 scale-105'
                            : 'bg-transparent text-light-text-secondary dark:text-dark-text-secondary hover:bg-white/50 dark:hover:bg-dark-card/50'
                            }`}
                    >
                        <ListBulletIcon className="w-4 h-4" />
                        <span>List</span>
                    </button>
                    <button
                        onClick={() => handleViewTypeChange('table')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${viewType === 'table'
                            ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/20 scale-105'
                            : 'bg-transparent text-light-text-secondary dark:text-dark-text-secondary hover:bg-white/50 dark:hover:bg-dark-card/50'
                            }`}
                    >
                        <Squares2X2Icon className="w-4 h-4" />
                        <span>Table</span>
                    </button>
                    {isMongoDBIntegration && (
                        <button
                            onClick={() => handleViewTypeChange('json')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${viewType === 'json'
                                ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/20 scale-105'
                                : 'bg-transparent text-light-text-secondary dark:text-dark-text-secondary hover:bg-white/50 dark:hover:bg-dark-card/50'
                                }`}
                        >
                            <CodeBracketIcon className="w-4 h-4" />
                            <span>JSON</span>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white/30 dark:bg-dark-bg-100/30 rounded-xl p-4 backdrop-blur-sm">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
