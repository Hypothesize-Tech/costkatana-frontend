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
        <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-3xl font-display font-bold gradient-text-primary">Usage Pattern Heatmap</h3>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">Interactive visualization of request patterns across time</p>
                </div>
                <div className="text-right">
                    <div className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium text-sm mb-1">7-Day Analysis</div>
                    <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">Hover cells for details</div>
                </div>
            </div>

            {/* Summary Dashboard */}
            {data.summary && (
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="glass rounded-xl p-6 text-center shadow-lg border border-primary-200/30 backdrop-blur-xl bg-gradient-primary/10">
                        <div className="text-4xl font-display font-bold gradient-text-primary mb-2">
                            {data.summary.totalRequests?.toLocaleString() || '0'}
                        </div>
                        <div className="font-display font-semibold text-primary-700 dark:text-primary-300">Total Requests</div>
                    </div>
                    <div className="glass rounded-xl p-6 text-center shadow-lg border border-success-200/30 backdrop-blur-xl bg-gradient-success/10">
                        <div className="text-4xl font-display font-bold gradient-text-success mb-2">
                            ${data.summary.totalCost?.toFixed(2) || '0.00'}
                        </div>
                        <div className="font-display font-semibold text-success-700 dark:text-success-300">Total Cost</div>
                    </div>
                    <div className="glass rounded-xl p-6 text-center shadow-lg border border-danger-200/30 backdrop-blur-xl bg-gradient-danger/10">
                        <div className="text-4xl font-display font-bold gradient-text-danger mb-2">
                            {data.summary.totalErrors || '0'}
                        </div>
                        <div className="font-display font-semibold text-danger-700 dark:text-danger-300">Total Errors</div>
                    </div>
                    <div className="glass rounded-xl p-6 text-center shadow-lg border border-accent-200/30 backdrop-blur-xl bg-gradient-accent/10">
                        <div className="text-4xl font-display font-bold gradient-text-accent mb-2">
                            {data.summary.peakTime || 'N/A'}
                        </div>
                        <div className="font-display font-semibold text-accent-700 dark:text-accent-300">Peak Time</div>
                    </div>
                </div>
            )}

            {/* Modern Heatmap Grid */}
            <div className="glass rounded-xl p-6 shadow-lg border border-primary-200/30 backdrop-blur-xl">
                {/* Day Headers */}
                <div className="grid grid-cols-8 gap-3 mb-4">
                    <div className="h-12"></div>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="h-12 flex items-center justify-center">
                            <div className="text-center">
                                <div className="font-display font-bold gradient-text-primary">{day.slice(0, 3)}</div>
                                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{day.slice(3)}</div>
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
                                <div className="font-display font-bold gradient-text-primary">{timeSlot.label}</div>
                                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{timeSlot.sublabel}</div>
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
                                    className="relative h-20 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10 group border border-primary-200/30 hover:border-primary-300/50"
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
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 min-w-64">
                                        <div className="font-display font-bold text-center mb-3 gradient-text-primary">
                                            {day.charAt(0).toUpperCase() + day.slice(1)} {timeSlot.label}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-light-text-secondary dark:text-dark-text-secondary">📊 Requests:</span>
                                                <span className="font-display font-semibold gradient-text-primary">{cellData.requests.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-light-text-secondary dark:text-dark-text-secondary">💰 Cost:</span>
                                                <span className="font-display font-semibold gradient-text-success">${cellData.cost?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-light-text-secondary dark:text-dark-text-secondary">⚠️ Errors:</span>
                                                <span className="font-display font-semibold gradient-text-danger">
                                                    {cellData.errors} ({cellData.requests > 0 ? ((cellData.errors / cellData.requests) * 100).toFixed(1) : '0'}%)
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-light-text-secondary dark:text-dark-text-secondary">⏱️ Avg Duration:</span>
                                                <span className="font-display font-semibold gradient-text-primary">{cellData.avgDuration?.toLocaleString() || '0'}ms</span>
                                            </div>
                                            <div className="border-t border-primary-200/30 pt-2 mt-3">
                                                <div className="text-center text-light-text-secondary dark:text-dark-text-secondary text-xs mb-1">Top Operation</div>
                                                <div className="text-center font-display font-semibold gradient-text-accent">
                                                    {cellData.topOperation?.split('.').pop() || 'none'} ({cellData.topOperationCount || '0'})
                                                </div>
                                            </div>
                                        </div>
                                        {/* Tooltip Arrow */}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary-200"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Modern Legend */}
                <div className="mt-8 flex items-center justify-center gap-8">
                    <div className="font-display font-semibold gradient-text-primary">Activity Intensity:</div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg glass border border-primary-200/30 shadow-lg backdrop-blur-xl"></div>
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">None</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-primary"></div>
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Low</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-success"></div>
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-warning"></div>
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-danger"></div>
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Peak</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-4 glass rounded-full px-6 py-3 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">🖱️ Hover for detailed metrics</span>
                        <span className="text-light-text-tertiary dark:text-dark-text-tertiary">•</span>
                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">🎯 Click to drill down</span>
                        <span className="text-light-text-tertiary dark:text-dark-text-tertiary">•</span>
                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">🌈 Colors show request intensity</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
