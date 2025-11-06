interface AnimatedIllustrationsProps {
    className?: string;
}

const icons = [
    {
        id: "dollar",
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z",
        style: { left: "10%", top: "20%", width: "40px", height: "40px", animationDelay: "0s" },
    },
    {
        id: "chart",
        path: "M3 13h8V3H3v10zm2-8h4v6H5V5zm8 4h8V3h-8v6zm2-4h4v2h-4V5zM3 21h8v-6H3v6zm2-4h4v2H5v-2zm8 8h8v-6h-8v6zm2-4h4v2h-4v-2z",
        style: { left: "70%", top: "15%", width: "35px", height: "35px", animationDelay: "1s" },
    },
    {
        id: "ai",
        path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        style: { left: "50%", top: "60%", width: "45px", height: "45px", animationDelay: "2s" },
    },
    {
        id: "lightning",
        path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        style: { left: "25%", top: "70%", width: "30px", height: "30px", animationDelay: "0.5s" },
    },
    {
        id: "trending",
        path: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
        style: { left: "80%", top: "50%", width: "38px", height: "38px", animationDelay: "1.5s" },
    },
];

export const AnimatedIllustrations = ({
    className = "",
}: AnimatedIllustrationsProps) => {
    return (
        <div
            className={`relative w-full min-h-[200px] ${className}`}
            style={{ willChange: "transform" }}
        >
            {icons.map((icon) => (
                <svg
                    key={icon.id}
                    className="absolute transition-all duration-300 hover:scale-110"
                    style={{
                        ...icon.style,
                        filter: "drop-shadow(0 0 8px rgba(6, 236, 158, 0.4))",
                        animation: `float 6s ease-in-out infinite`,
                        animationDelay: icon.style.animationDelay,
                    }}
                    viewBox="0 0 24 24"
                    fill={`url(#gradient-${icon.id})`}
                >
                    <defs>
                        <linearGradient id={`gradient-${icon.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06ec9e" />
                            <stop offset="100%" stopColor="#009454" />
                        </linearGradient>
                    </defs>
                    <path d={icon.path} />
                </svg>
            ))}
        </div>
    );
};
