import React from 'react';

interface HeatmapData {
    detailedData?: Record<string, {
        requests: number;
        cost: number;
        errors: number;
        avgDuration: number;
        topOperation: string;
        topOperationCount: number;
    }>;
    summary?: {
        totalRequests: number;
        totalCost: number;
        totalErrors: number;
        peakTime: string;
    };
}

interface ModernHeatmapProps {
    data: HeatmapData;
    onCellClick: (cellData: any) => void;
}

export const ModernHeatmap: React.FC<ModernHeatmapProps> = ({ data, onCellClick }) => {
    return (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">Usage Pattern Heatmap</h3>
                    <p className="text-gray-600 mt-1">Interactive visualization of request patterns across time</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">7-Day Analysis</div>
                    <div className="text-xs text-gray-400">Hover cells for details</div>
                </div>
            </div>

            {/* Summary Dashboard */}
            {data.summary && (
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center shadow-lg">
                        <div className="text-3xl font-bold mb-1">
                            {data.summary.totalRequests?.toLocaleString() || '0'}
                        </div>
                        <div className="text-blue-100 text-sm font-medium">Total Requests</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white text-center shadow-lg">
                        <div className="text-3xl font-bold mb-1">
                            ${data.summary.totalCost?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-green-100 text-sm font-medium">Total Cost</div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white text-center shadow-lg">
                        <div className="text-3xl font-bold mb-1">
                            {data.summary.totalErrors || '0'}
                        </div>
                        <div className="text-red-100 text-sm font-medium">Total Errors</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white text-center shadow-lg">
                        <div className="text-3xl font-bold mb-1">
                            {data.summary.peakTime || 'N/A'}
                        </div>
                        <div className="text-purple-100 text-sm font-medium">Peak Time</div>
                    </div>
                </div>
            )}

            {/* Modern Heatmap Grid */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
                {/* Day Headers */}
                <div className="grid grid-cols-8 gap-3 mb-4">
                    <div className="h-12"></div>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="h-12 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-sm font-bold text-gray-700">{day.slice(0, 3)}</div>
                                <div className="text-xs text-gray-500">{day.slice(3)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Heatmap Rows */}
                {[
                    { label: 'Night', sublabel: '00:00 - 06:00', key: 'night' },
                    { label: 'Morning', sublabel: '06:00 - 12:00', key: 'morning' },
                    { label: 'Afternoon', sublabel: '12:00 - 18:00', key: 'afternoon' },
                    { label: 'Evening', sublabel: '18:00 - 24:00', key: 'evening' }
                ].map((timeSlot) => (
                    <div key={timeSlot.key} className="grid grid-cols-8 gap-3 mb-3">
                        <div className="h-20 flex items-center">
                            <div className="text-right pr-4">
                                <div className="text-sm font-bold text-gray-700">{timeSlot.label}</div>
                                <div className="text-xs text-gray-500">{timeSlot.sublabel}</div>
                            </div>
                        </div>
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                            const cellKey = `${day}_${timeSlot.key}`;
                            const cellData = data.detailedData?.[cellKey] || {
                                requests: 0,
                                cost: 0,
                                errors: 0,
                                avgDuration: 0,
                                topOperation: 'none',
                                topOperationCount: 0
                            };

                            // Calculate RGB color based on request intensity
                            const maxRequests = Math.max(...Object.values(data.detailedData || {}).map((d: any) => d.requests || 0));
                            const intensity = maxRequests > 0 ? Math.min(cellData.requests / maxRequests, 1) : 0;

                            // Smooth RGB gradient: Blue -> Green -> Yellow -> Red
                            let r, g, b;
                            if (intensity === 0) {
                                r = 248; g = 250; b = 252; // Very light gray
                            } else if (intensity <= 0.25) {
                                // Blue to Cyan
                                const t = intensity / 0.25;
                                r = Math.floor(59 + t * (34 - 59));
                                g = Math.floor(130 + t * (197 - 130));
                                b = Math.floor(246 + t * (94 - 246));
                            } else if (intensity <= 0.5) {
                                // Cyan to Green
                                const t = (intensity - 0.25) / 0.25;
                                r = Math.floor(34 + t * (16 - 34));
                                g = Math.floor(197 + t * (185 - 197));
                                b = Math.floor(94 + t * (129 - 94));
                            } else if (intensity <= 0.75) {
                                // Green to Yellow
                                const t = (intensity - 0.5) / 0.25;
                                r = Math.floor(16 + t * (245 - 16));
                                g = Math.floor(185 + t * (158 - 185));
                                b = Math.floor(129 + t * (11 - 129));
                            } else {
                                // Yellow to Red
                                const t = (intensity - 0.75) / 0.25;
                                r = Math.floor(245 + t * (220 - 245));
                                g = Math.floor(158 + t * (38 - 158));
                                b = Math.floor(11 + t * (127 - 11));
                            }

                            const backgroundColor = `rgb(${r}, ${g}, ${b})`;
                            const textColor = intensity > 0.5 ? 'white' : 'rgb(55, 65, 81)';

                            return (
                                <div
                                    key={cellKey}
                                    className="relative h-20 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10 group border border-gray-200"
                                    style={{ backgroundColor }}
                                    onClick={() => {
                                        onCellClick({
                                            ...cellData,
                                            day: day.charAt(0).toUpperCase() + day.slice(1),
                                            timeSlot: timeSlot.label
                                        });
                                    }}
                                >
                                    {/* Cell Content */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                        <div className="text-lg font-bold" style={{ color: textColor }}>
                                            {cellData.requests > 999 ? `${(cellData.requests / 1000).toFixed(1)}k` : cellData.requests}
                                        </div>
                                        <div className="text-xs opacity-75" style={{ color: textColor }}>
                                            requests
                                        </div>
                                        {cellData.cost > 0 && (
                                            <div className="text-xs font-medium mt-1" style={{ color: textColor }}>
                                                ${cellData.cost.toFixed(2)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Enhanced Hover Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-2xl min-w-64">
                                        <div className="font-bold text-center mb-2 text-blue-300">
                                            {day.charAt(0).toUpperCase() + day.slice(1)} {timeSlot.label}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">📊 Requests:</span>
                                                <span className="font-semibold">{cellData.requests.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">💰 Cost:</span>
                                                <span className="font-semibold text-green-400">${cellData.cost?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">⚠️ Errors:</span>
                                                <span className="font-semibold text-red-400">
                                                    {cellData.errors} ({cellData.requests > 0 ? ((cellData.errors / cellData.requests) * 100).toFixed(1) : '0'}%)
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">⏱️ Avg Duration:</span>
                                                <span className="font-semibold">{cellData.avgDuration?.toLocaleString() || '0'}ms</span>
                                            </div>
                                            <div className="border-t border-gray-700 pt-2 mt-2">
                                                <div className="text-center text-gray-300 text-xs">Top Operation</div>
                                                <div className="text-center font-semibold text-yellow-400">
                                                    {cellData.topOperation?.split('.').pop() || 'none'} ({cellData.topOperationCount || '0'})
                                                </div>
                                            </div>
                                        </div>
                                        {/* Tooltip Arrow */}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Modern Legend */}
                <div className="mt-8 flex items-center justify-center space-x-8">
                    <div className="text-sm font-medium text-gray-600">Activity Intensity:</div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg bg-gray-100 border border-gray-200"></div>
                            <span className="text-sm text-gray-600">None</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: 'rgb(59, 130, 246)' }}></div>
                            <span className="text-sm text-gray-600">Low</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: 'rgb(16, 185, 129)' }}></div>
                            <span className="text-sm text-gray-600">Medium</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: 'rgb(245, 158, 11)' }}></div>
                            <span className="text-sm text-gray-600">High</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: 'rgb(220, 38, 127)' }}></div>
                            <span className="text-sm text-gray-600">Peak</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex items-center space-x-4 text-sm text-gray-500 bg-gray-50 rounded-full px-6 py-2">
                        <span>🖱️ Hover for detailed metrics</span>
                        <span>•</span>
                        <span>🎯 Click to drill down</span>
                        <span>•</span>
                        <span>🌈 Colors show request intensity</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
