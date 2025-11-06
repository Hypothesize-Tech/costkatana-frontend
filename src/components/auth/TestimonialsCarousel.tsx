import { useState, useEffect } from "react";

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    avatar?: string;
}

interface TestimonialsCarouselProps {
    testimonials?: Testimonial[];
    autoRotateInterval?: number;
    className?: string;
}

const defaultTestimonials: Testimonial[] = [
    {
        name: "Nivedita",
        role: "Founder",
        company: "P3M AI",
        quote: "Cost Katana transformed how we manage our AI expenses. As a startup, every dollar counts, and the detailed insights helped us optimize our spending by 42%. Essential tool for any AI-first company.",
    },
    {
        name: "James Mitchell",
        role: "VP of Engineering",
        company: "DataSync Solutions",
        quote: "We integrated Cost Katana across our AI infrastructure and cut our monthly API spend by 35%. The detailed breakdowns help us make data-driven decisions.",
    },
    {
        name: "Priya Sharma",
        role: "Head of AI",
        company: "CloudVantage Technologies",
        quote: "The optimization recommendations are spot-on. We've reduced token usage by 28% without compromising on quality. This tool pays for itself.",
    },
    {
        name: "Marcus Thompson",
        role: "Engineering Director",
        company: "Nexus Analytics",
        quote: "Cost Katana gives us visibility into costs we never had before. The multi-provider tracking is exactly what we needed for our distributed AI workloads.",
    },
    {
        name: "Sophie Laurent",
        role: "CTO",
        company: "TechFlow Systems",
        quote: "Our AI costs were spiraling out of control. Cost Katana helped us identify waste and optimize our prompts. We're saving $40K+ monthly now.",
    },
    {
        name: "Raj Patel",
        role: "Senior ML Engineer",
        company: "IntelliCore Labs",
        quote: "As someone who works with AI models daily, I appreciate how Cost Katana breaks down costs by model and use case. It's become essential for our team.",
    },
    {
        name: "Emma Wilson",
        role: "Product Lead",
        company: "Streamline AI",
        quote: "The real-time alerts and cost forecasting features are game-changers. We can now budget accurately and catch anomalies before they become problems.",
    },
];

export const TestimonialsCarousel = ({
    testimonials = defaultTestimonials,
    autoRotateInterval = 5000,
    className = "",
}: TestimonialsCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, autoRotateInterval);

        return () => clearInterval(interval);
    }, [isPaused, autoRotateInterval, testimonials.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative min-h-[220px] overflow-hidden">
                {testimonials.map((testimonial, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex
                            ? "opacity-100 z-10 pointer-events-auto"
                            : "opacity-0 z-0 pointer-events-none"
                            }`}
                    >
                        <div className="p-6 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0">
                                    {testimonial.avatar ? (
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full border-2 border-white/30"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
                                            {getInitials(testimonial.name)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white/90 italic text-base leading-relaxed">
                                        "{testimonial.quote}"
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
                                <div>
                                    <p className="text-white font-semibold text-sm">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-white/70 text-xs">
                                        {testimonial.role} at {testimonial.company}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? "w-8 bg-white"
                            : "w-2 bg-white/40 hover:bg-white/60"
                            }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

