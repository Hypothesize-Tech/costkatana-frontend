import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { DependencyResponse } from '../../types/telemetry';
import { ServerIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

export const ServiceDependencyGraph: React.FC = () => {
    const { data: dependencyData, isLoading, error, refetch } = useQuery<DependencyResponse>({
        queryKey: ['service-dependencies', 'graph'],
        queryFn: TelemetryAPI.getServiceDependencies,
        refetchInterval: 60000,
        staleTime: 60000
    });

    const processedData = useMemo(() => {
        const services = dependencyData?.services || [];
        const dependencies = dependencyData?.dependencies || [];
        const serviceMap = new Map(
            services.map(service => [
                service.id,
                {
                    ...service,
                    requestCount: dependencies
                        .filter(dep => dep.source === service.id)
                        .reduce((sum, dep) => sum + dep.call_count, 0)
                }
            ])
        );
        return { services: Array.from(serviceMap.values()), dependencies };
    }, [dependencyData]);

    if (isLoading) return (
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel animate-pulse">
            <div className="h-64 bg-gradient-primary/20 rounded-xl" />
        </div>
    );

    if (error) return (
        <div className="glass rounded-xl p-6 border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm">⚠️</span>
                    </div>
                    <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                        Error loading service dependencies
                    </span>
                </div>
                <button onClick={() => refetch()} className="btn-secondary inline-flex items-center gap-2">
                    <ArrowPathIcon className="w-4 h-4" /> Retry
                </button>
            </div>
        </div>
    );

    if (processedData.services.length === 0) return (
        <div className="glass rounded-xl p-8 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-accent/20 flex items-center justify-center mx-auto mb-4">
                <ServerIcon className="w-8 h-8 text-accent-500" />
            </div>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">No service dependencies found</p>
            <button onClick={() => refetch()} className="btn-primary">Refresh</button>
        </div>
    );

    return (
        <div className="glass rounded-xl p-8 border border-secondary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                        <ServerIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-secondary">
                        Service Dependency Graph
                    </h2>
                </div>
                <button onClick={() => refetch()} className="btn-secondary inline-flex items-center gap-2">
                    <ArrowPathIcon className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="w-full h-[500px] glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl overflow-auto">
                <svg viewBox="0 0 1000 500" className="w-full h-full">
                    <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {processedData.services.map((service, index) => {
                        const x = 200 + (index % 3) * 300;
                        const y = 100 + Math.floor(index / 3) * 200;
                        return (
                            <g key={service.id}>
                                <circle cx={x} cy={y} r="52" fill={service.requestCount > 100 ? '#e0f2fe' : '#eff6ff'} stroke="#3b82f6" strokeWidth="2" />
                                <text x={x} y={y - 10} textAnchor="middle" className="text-sm font-semibold">{service.name}</text>
                                <text x={x} y={y + 14} textAnchor="middle" className="text-xs text-gray-600">Requests: {service.requestCount}</text>
                            </g>
                        );
                    })}

                    {processedData.dependencies.map((dep) => {
                        const sourceNode = processedData.services.find(s => s.id === dep.source);
                        const targetNode = processedData.services.find(s => s.id === dep.target);
                        if (!sourceNode || !targetNode) return null;
                        const sourceIndex = processedData.services.indexOf(sourceNode);
                        const targetIndex = processedData.services.indexOf(targetNode);
                        const sourceX = 200 + (sourceIndex % 3) * 300;
                        const sourceY = 100 + Math.floor(sourceIndex / 3) * 200;
                        const targetX = 200 + (targetIndex % 3) * 300;
                        const targetY = 100 + Math.floor(targetIndex / 3) * 200;
                        const edgeColor = dep.error_rate > 0.1 ? '#ef4444' : dep.error_rate > 0.05 ? '#eab308' : '#22c55e';
                        return (
                            <g key={`${dep.source}-${dep.target}`}>
                                <line x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} stroke={edgeColor} strokeWidth={Math.min(5, Math.log(dep.call_count + 1))} strokeOpacity="0.8" markerEnd="url(#arrowhead)" />
                                <text x={(sourceX + targetX) / 2} y={(sourceY + targetY) / 2} textAnchor="middle" className="text-xs text-gray-600">{dep.call_count} calls</text>
                            </g>
                        );
                    })}

                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                        </marker>
                    </defs>
                </svg>
            </div>
        </div>
    );
};
