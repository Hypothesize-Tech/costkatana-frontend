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
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200 animate-pulse">
            <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
    );

    if (error) return (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl ring-1 ring-rose-200">
            Error loading service dependencies
            <button onClick={() => refetch()} className="ml-4 bg-rose-100 px-3 py-1 rounded inline-flex items-center">
                <ArrowPathIcon className="w-4 h-4 mr-1" /> Retry
            </button>
        </div>
    );

    if (processedData.services.length === 0) return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200 text-center">
            <p className="text-gray-600">No service dependencies found</p>
            <button onClick={() => refetch()} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Refresh</button>
        </div>
    );

    return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ServerIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Service Dependency Graph
                </h2>
                <button onClick={() => refetch()} className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center">
                    <ArrowPathIcon className="w-4 h-4 mr-1" /> Refresh
                </button>
            </div>

            <div className="w-full h-[500px] border rounded-xl overflow-auto">
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
