import React, { useState } from 'react';
import { AI_SERVICES } from '../../utils/constant';

interface ServiceIconProps {
    service: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
};

const containerSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
};

export const ServiceIcon: React.FC<ServiceIconProps> = ({
    service,
    className = '',
    size = 'md'
}) => {
    const [logoError, setLogoError] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const serviceData = AI_SERVICES[service as keyof typeof AI_SERVICES];
    const serviceColor = serviceData?.color || '#999';
    const serviceLogo = serviceData?.logo;
    const sizeClass = sizeClasses[size];
    const containerSize = containerSizeClasses[size];

    // Only use logos - no icon fallback
    if (!serviceLogo) {
        return null;
    }

    return (
        <div
            className={`flex justify-center items-center ${containerSize} rounded-lg overflow-hidden ${className}`}
            style={{ backgroundColor: serviceColor }}
        >
            {!logoError ? (
                <img
                    src={serviceLogo}
                    alt={serviceData?.name || service}
                    className={`${sizeClass} object-contain p-1`}
                    onError={() => {
                        setLogoError(true);
                        setLogoLoaded(false);
                    }}
                    onLoad={() => {
                        setLogoLoaded(true);
                        setLogoError(false);
                    }}
                    style={{ display: logoLoaded ? 'block' : 'none' }}
                />
            ) : (
                <div className={`${sizeClass} bg-white/10 rounded flex items-center justify-center`}>
                    <span className="text-xs text-white/50 font-medium">
                        {serviceData?.name?.charAt(0) || service.charAt(0).toUpperCase()}
                    </span>
                </div>
            )}
            {!logoLoaded && !logoError && (
                <div className={`${sizeClass} animate-pulse bg-white/20 rounded`} />
            )}
        </div>
    );
};

