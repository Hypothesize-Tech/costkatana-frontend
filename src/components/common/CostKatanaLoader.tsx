import React from 'react';
import logoImage from '@/assets/logo.jpg';

interface CostKatanaLoaderProps {
    size?: 'small' | 'medium' | 'large' | 'xl';
    showText?: boolean;
    text?: string;
    className?: string;
}

export const CostKatanaLoader: React.FC<CostKatanaLoaderProps> = ({
    size = 'medium',
    showText = true,
    text = 'Loading...',
    className = '',
}) => {
    const sizeClasses = {
        small: {
            container: 'w-16 h-16',
            logo: 'w-12 h-12',
            text: 'text-sm mt-3',
            glow: 'w-20 h-20',
        },
        medium: {
            container: 'w-24 h-24',
            logo: 'w-18 h-18',
            text: 'text-base mt-4',
            glow: 'w-32 h-32',
        },
        large: {
            container: 'w-32 h-32',
            logo: 'w-24 h-24',
            text: 'text-lg mt-6',
            glow: 'w-40 h-40',
        },
        xl: {
            container: 'w-48 h-48',
            logo: 'w-36 h-36',
            text: 'text-xl mt-8',
            glow: 'w-56 h-56',
        },
    };

    const classes = sizeClasses[size];

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            {/* Ambient Glow Background */}
            <div className={`absolute ${classes.glow} -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2`}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-success-500/30 to-accent-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-l from-success-500/15 via-primary-500/25 to-highlight-500/15 rounded-full blur-2xl animate-pulse animation-delay-500"></div>
            </div>

            {/* 3D Animated Logo Container */}
            <div className={`relative ${classes.container} flex items-center justify-center perspective-1000`} style={{ transform: 'perspective(1000px)' }}>
                {/* Outer rotating glow ring with 3D effect */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-400 animate-spin shadow-2xl"
                    style={{
                        filter: 'drop-shadow(0 0 20px rgba(6, 236, 158, 0.6))',
                        transform: 'rotateX(15deg) rotateY(15deg)'
                    }}>
                </div>

                {/* Middle rotating ring with reverse spin */}
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-success-500 border-l-success-400 animate-spin animation-delay-300"
                    style={{
                        animationDirection: 'reverse',
                        filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.5))',
                        transform: 'rotateX(-10deg) rotateY(-10deg)'
                    }}>
                </div>

                {/* Inner fast rotating accent ring */}
                <div className="absolute inset-4 rounded-full border border-transparent border-t-accent-500 border-b-highlight-500 animate-spin animation-delay-150"
                    style={{
                        animationDuration: '1s',
                        filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.4))',
                        transform: 'rotateX(5deg) rotateY(5deg)'
                    }}>
                </div>

                {/* Rotating glow effect */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-r from-transparent via-primary-500/30 to-transparent animate-spin animation-delay-200"
                    style={{ animationDuration: '2s' }}>
                </div>

                {/* Pulsing inner glow */}
                <div className="absolute inset-3 rounded-full bg-gradient-to-r from-primary-500/30 via-success-500/40 to-accent-500/30 animate-pulse blur-sm"></div>

                {/* 3D Logo Container */}
                <div className={`relative ${classes.logo} rounded-full overflow-hidden shadow-2xl`}
                    style={{
                        transform: 'rotateX(5deg) rotateY(5deg) translateZ(20px)',
                        filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
                        boxShadow: '0 0 40px rgba(6, 236, 158, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                    }}>
                    <img
                        src={logoImage}
                        alt="Cost Katana"
                        className="w-full h-full object-contain filter drop-shadow-2xl animate-pulse"
                        style={{
                            filter: 'drop-shadow(0 0 10px rgba(6, 236, 158, 0.3)) brightness(1.1) contrast(1.1)'
                        }}
                    />

                    {/* 3D Logo overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-success-500/20 mix-blend-overlay"></div>

                    {/* Rotating highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-spin opacity-60"
                        style={{ animationDuration: '3s' }}>
                    </div>
                </div>

                {/* Enhanced floating particles with 3D movement */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-primary-400 rounded-full animate-ping animation-delay-300 shadow-lg"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(6, 236, 158, 0.8))' }}>
                </div>
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-success-400 rounded-full animate-ping animation-delay-500 shadow-lg"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))' }}>
                </div>
                <div className="absolute top-1 -left-3 w-1.5 h-1.5 bg-accent-400 rounded-full animate-ping animation-delay-700 shadow-lg"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.8))' }}>
                </div>
                <div className="absolute -top-3 right-1 w-1 h-1 bg-highlight-400 rounded-full animate-ping animation-delay-1000 shadow-lg"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(14, 165, 233, 0.8))' }}>
                </div>

                {/* Orbiting elements */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
                    <div className="absolute -top-1 left-1/2 w-1 h-1 bg-primary-300 rounded-full shadow-lg transform -translate-x-1/2"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(6, 236, 158, 0.6))' }}>
                    </div>
                </div>
                <div className="absolute inset-0 animate-spin animation-delay-500" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
                    <div className="absolute top-1/2 -right-1 w-1 h-1 bg-success-300 rounded-full shadow-lg transform -translate-y-1/2"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' }}>
                    </div>
                </div>
            </div>

            {/* Loading Text */}
            {showText && (
                <div className={`${classes.text} font-display font-semibold text-center`}>
                    <div className="gradient-text animate-pulse">
                        {text}
                    </div>

                    {/* Animated dots */}
                    <div className="flex justify-center space-x-1 mt-1">
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce animation-delay-150"></div>
                        <div className="w-1 h-1 bg-primary-500 rounded-full animate-bounce animation-delay-300"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Full screen loader variant
export const CostKatanaFullScreenLoader: React.FC<{
    text?: string;
    showProgress?: boolean;
    progress?: number;
}> = ({ text = 'Loading Cost Katana...', showProgress = false, progress = 0 }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-light-ambient dark:bg-gradient-dark-ambient backdrop-blur-sm">
            {/* Background overlay */}
            <div className="absolute inset-0 bg-light-bg-primary/80 dark:bg-dark-bg-primary/80"></div>

            {/* Ambient glow effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success-500/10 rounded-full blur-3xl animate-pulse animation-delay-500"></div>

            {/* Main loader content */}
            <div className="relative z-10 flex flex-col items-center justify-center p-8">
                {/* Enhanced Large 3D animated logo */}
                <div className="relative w-48 h-48 mb-8" style={{ transform: 'perspective(1200px)' }}>
                    {/* Massive ambient glow */}
                    <div className="absolute -inset-16 bg-gradient-to-r from-primary-500/10 via-success-500/20 to-accent-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -inset-12 bg-gradient-to-l from-success-500/15 via-primary-500/25 to-highlight-500/15 rounded-full blur-2xl animate-pulse animation-delay-300"></div>

                    {/* Outer rotating rings with 3D effects */}
                    <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary-500 border-r-primary-400 animate-spin shadow-2xl"
                        style={{
                            filter: 'drop-shadow(0 0 40px rgba(6, 236, 158, 0.8))',
                            transform: 'rotateX(20deg) rotateY(20deg)'
                        }}>
                    </div>
                    <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-success-500 border-l-success-400 animate-spin animation-delay-300"
                        style={{
                            animationDirection: 'reverse',
                            filter: 'drop-shadow(0 0 30px rgba(34, 197, 94, 0.7))',
                            transform: 'rotateX(-15deg) rotateY(-15deg)'
                        }}>
                    </div>
                    <div className="absolute inset-8 rounded-full border-2 border-transparent border-t-accent-500 border-b-highlight-500 animate-spin animation-delay-150"
                        style={{
                            animationDuration: '1.5s',
                            filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.6))',
                            transform: 'rotateX(10deg) rotateY(10deg)'
                        }}>
                    </div>

                    {/* Multiple rotating glow effects */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-transparent via-primary-500/40 to-transparent animate-spin animation-delay-200"
                        style={{ animationDuration: '3s' }}>
                    </div>
                    <div className="absolute inset-6 rounded-full bg-gradient-to-l from-transparent via-success-500/30 to-transparent animate-spin animation-delay-500"
                        style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
                    </div>

                    {/* Enhanced pulsing glow */}
                    <div className="absolute inset-10 rounded-full bg-gradient-to-r from-primary-500/40 via-success-500/50 to-accent-500/40 animate-pulse blur-md"></div>

                    {/* 3D Logo container with enhanced effects */}
                    <div className="absolute inset-12 rounded-full overflow-hidden shadow-2xl"
                        style={{
                            transform: 'rotateX(10deg) rotateY(10deg) translateZ(30px)',
                            filter: 'drop-shadow(0 20px 60px rgba(0, 0, 0, 0.4))',
                            boxShadow: '0 0 80px rgba(6, 236, 158, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.15)'
                        }}>
                        <img
                            src={logoImage}
                            alt="Cost Katana"
                            className="w-full h-full object-contain animate-pulse"
                            style={{
                                filter: 'drop-shadow(0 0 20px rgba(6, 236, 158, 0.5)) brightness(1.2) contrast(1.2) saturate(1.1)'
                            }}
                        />

                        {/* Enhanced 3D overlay effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-transparent to-success-500/30 mix-blend-overlay"></div>

                        {/* Multiple rotating highlight effects */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-spin opacity-70"
                            style={{ animationDuration: '4s' }}>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary-300/30 to-transparent animate-spin opacity-50"
                            style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
                        </div>
                    </div>

                    {/* Enhanced floating particles with glow */}
                    <div className="absolute -top-4 -right-4 w-3 h-3 bg-primary-400 rounded-full animate-ping animation-delay-300 shadow-2xl"
                        style={{ filter: 'drop-shadow(0 0 15px rgba(6, 236, 158, 1))' }}>
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-success-400 rounded-full animate-ping animation-delay-500 shadow-2xl"
                        style={{ filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 1))' }}>
                    </div>
                    <div className="absolute top-2 -left-6 w-2 h-2 bg-accent-400 rounded-full animate-ping animation-delay-700 shadow-2xl"
                        style={{ filter: 'drop-shadow(0 0 12px rgba(234, 179, 8, 1))' }}>
                    </div>
                    <div className="absolute -top-6 right-2 w-2 h-2 bg-highlight-400 rounded-full animate-ping animation-delay-1000 shadow-2xl"
                        style={{ filter: 'drop-shadow(0 0 12px rgba(14, 165, 233, 1))' }}>
                    </div>

                    {/* Multiple orbiting elements */}
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s' }}>
                        <div className="absolute -top-2 left-1/2 w-2 h-2 bg-primary-300 rounded-full shadow-2xl transform -translate-x-1/2"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(6, 236, 158, 0.8))' }}>
                        </div>
                    </div>
                    <div className="absolute inset-0 animate-spin animation-delay-300" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
                        <div className="absolute top-1/2 -right-2 w-2 h-2 bg-success-300 rounded-full shadow-2xl transform -translate-y-1/2"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))' }}>
                        </div>
                    </div>
                    <div className="absolute inset-0 animate-spin animation-delay-700" style={{ animationDuration: '10s' }}>
                        <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-accent-300 rounded-full shadow-2xl transform -translate-x-1/2"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.8))' }}>
                        </div>
                    </div>
                </div>

                {/* Loading text */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-display font-bold gradient-text mb-2">
                        {text}
                    </h2>

                    {/* Animated subtitle */}
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary animate-pulse">
                        Optimizing your AI costs...
                    </p>
                </div>

                {/* Progress bar (optional) */}
                {showProgress && (
                    <div className="w-64 mb-4">
                        <div className="flex justify-between text-xs font-medium text-light-text-muted dark:text-dark-text-muted mb-2">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-light-bg-300 dark:bg-dark-bg-300 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-primary rounded-full transition-all duration-500 ease-out shadow-lg"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Animated dots */}
                <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce animation-delay-150"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce animation-delay-300"></div>
                </div>
            </div>
        </div>
    );
};

// Inline loader for small spaces with enhanced effects
export const CostKatanaInlineLoader: React.FC<{
    text?: string;
    className?: string;
}> = ({ text = 'Loading...', className = '' }) => {
    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className="relative w-8 h-8">
                {/* Ambient glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-success-500/20 rounded-full blur-lg animate-pulse"></div>

                {/* Outer ring with glow */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(6, 236, 158, 0.6))' }}>
                </div>

                {/* Inner ring */}
                <div className="absolute inset-1 rounded-full border border-transparent border-t-success-400 animate-spin animation-delay-150"
                    style={{ animationDirection: 'reverse', filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))' }}>
                </div>

                {/* Logo container with 3D effect */}
                <div className="absolute inset-2 rounded-full overflow-hidden shadow-lg"
                    style={{
                        filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
                        boxShadow: '0 0 12px rgba(6, 236, 158, 0.3)'
                    }}>
                    <img
                        src={logoImage}
                        alt="Cost Katana"
                        className="w-full h-full object-contain animate-pulse"
                        style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                    />

                    {/* Rotating highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-spin opacity-50"
                        style={{ animationDuration: '2s' }}>
                    </div>
                </div>

                {/* Floating particle */}
                <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-primary-400 rounded-full animate-ping animation-delay-300"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(6, 236, 158, 0.8))' }}>
                </div>
            </div>
            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary animate-pulse">
                {text}
            </span>
        </div>
    );
};
