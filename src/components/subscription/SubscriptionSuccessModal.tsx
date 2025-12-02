import React, { useEffect, useRef, useState } from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SubscriptionSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: string;
    billingInterval: string;
    amount: number;
    currency?: string;
}

export const SubscriptionSuccessModal: React.FC<SubscriptionSuccessModalProps> = ({
    isOpen,
    onClose,
    plan,
    billingInterval,
    amount,
    currency = 'USD',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        if (!isOpen || !showConfetti) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confetti: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            color: string;
            size: number;
            rotation: number;
            rotationSpeed: number;
        }> = [];

        // Use app theme colors: primary teal, success green, and accent colors
        const colors = ['#06ec9e', '#22c55e', '#10b981', '#6366f1', '#8b5cf6', '#f59e0b'];

        // Create confetti particles
        for (let i = 0; i < 150; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
            });
        }

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confetti.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.rotation += particle.rotationSpeed;
                particle.vy += 0.1; // Gravity

                // Draw confetti
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();

                // Remove particles that are off screen
                if (particle.y > canvas.height + 20) {
                    confetti.splice(index, 1);
                }
            });

            if (confetti.length > 0) {
                animationId = requestAnimationFrame(animate);
            } else {
                setShowConfetti(false);
            }
        };

        animate();

        // Stop confetti after 5 seconds
        const timeout = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            clearTimeout(timeout);
        };
    }, [isOpen, showConfetti]);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Confetti Canvas */}
            {showConfetti && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 1 }}
                />
            )}

            {/* Modal */}
            <div className="relative z-10 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 max-w-md w-full transform transition-all">
                <button
                    onClick={onClose}
                    className="btn absolute top-4 right-4 p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
                >
                    <XMarkIcon className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary" />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Success Icon with Animation */}
                    <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-success flex items-center justify-center shadow-lg shadow-success-500/30 animate-bounce">
                            <CheckCircleIcon className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 animate-pulse">
                            <SparklesIcon className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-display font-bold gradient-text-primary mb-2">
                        Payment Successful!
                    </h2>

                    {/* Message */}
                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-6">
                        Your subscription has been activated successfully. You can now enjoy all the features of your plan.
                    </p>

                    {/* Subscription Details */}
                    <div className="w-full glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 p-4 mb-6 space-y-2 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                Plan:
                            </span>
                            <span className="font-semibold text-light-text dark:text-dark-text capitalize">
                                {plan}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                Billing:
                            </span>
                            <span className="font-semibold text-light-text dark:text-dark-text capitalize">
                                {billingInterval}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-primary-200/20 dark:border-primary-800/20">
                            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                Amount:
                            </span>
                            <span className="text-lg font-bold text-primary-500">
                                {currency === 'INR' ? '₹' : '$'}
                                {amount.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="btn btn-primary w-full px-6 py-3 font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-primary"
                    >
                        Continue
                    </button>

                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-4">
                        You can now enjoy all the features of your plan!
                    </p>
                </div>
            </div>
        </div>
    );
};

