import { useLaunchDate } from '../../hooks/useLaunchDate';

export const LaunchScreen = () => {
    const { isLaunched, countdown } = useLaunchDate();

    if (isLaunched) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center light:bg-gradient-light-ambient dark:bg-gradient-dark-ambient overflow-hidden">
            {/* Animated ambient glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-success-500/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-3/4 left-1/3 w-[350px] h-[350px] bg-highlight-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
            </div>

            {/* Content Container */}
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                {/* Logo/Brand Area */}
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-2xl bg-gradient-primary shadow-2xl shadow-primary-500/30 animate-float">
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                        Cost Katana
                    </h1>
                    <p className="text-xl md:text-2xl text-light-text-secondary dark:text-dark-text-secondary font-medium">
                        AI Cost Intelligence Platform
                    </p>
                </div>

                {/* Launch Announcement */}
                <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="inline-block px-6 py-2 mb-4 rounded-full bg-primary-500/10 border border-primary-500/30 backdrop-blur-sm">
                        <span className="text-primary-500 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
                            Coming Soon
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
                        Launching December 10th, 2025
                    </h2>
                    <p className="text-lg text-light-text-secondary dark:text-dark-text-muted max-w-2xl mx-auto">
                        Revolutionary AI cost optimization and intelligence platform. Be ready to slash your AI costs and gain unprecedented insights.
                    </p>
                </div>

                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-4 md:gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    {[
                        { value: countdown.days, label: 'Days' },
                        { value: countdown.hours, label: 'Hours' },
                        { value: countdown.minutes, label: 'Minutes' },
                        { value: countdown.seconds, label: 'Seconds' }
                    ].map((item, index) => (
                        <div
                            key={item.label}
                            className="relative group"
                            style={{ animationDelay: `${0.6 + (index * 0.1)}s` }}
                        >
                            <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity" />
                            <div className="relative backdrop-blur-md bg-light-card dark:bg-dark-card border border-light-text-muted/10 dark:border-dark-text-muted/10 rounded-2xl p-6 shadow-xl">
                                <div className="text-4xl md:text-5xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent mb-2">
                                    {String(item.value).padStart(2, '0')}
                                </div>
                                <div className="text-sm md:text-base text-light-text-secondary dark:text-dark-text-muted font-medium uppercase tracking-wide">
                                    {item.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                    {[
                        { icon: '💰', title: 'Cost Reduction', desc: 'Save up to 80% on AI costs' },
                        { icon: '🚀', title: 'Real-time Analytics', desc: 'Monitor every AI request' },
                        { icon: '🛡️', title: 'Enterprise Security', desc: 'Bank-level protection' }
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            className="backdrop-blur-md bg-light-panel/50 dark:bg-dark-panel/50 border border-light-text-muted/10 dark:border-dark-text-muted/10 rounded-xl p-6 hover:border-primary-500/30 transition-all group"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-muted">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
                    <p className="text-light-text-muted dark:text-dark-text-muted mb-2">
                        Get ready for the future of AI cost management
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                        <span>Platform under development</span>
                    </div>
                </div>
            </div>

            {/* Bottom decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-50" />
        </div>
    );
};

