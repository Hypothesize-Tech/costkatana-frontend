import React from 'react';

interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    className = ''
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={`w-full bg-primary-200/30 rounded-full overflow-hidden shadow-inner ${className}`}>
            <div
                className="h-full bg-gradient-primary shadow-lg transition-all duration-500 ease-out progress-bar"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};
