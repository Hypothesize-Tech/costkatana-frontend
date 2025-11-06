import { useMemo } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { cn } from "@/utils/helpers";

interface PasswordStrengthIndicatorProps {
    password: string;
    showRequirements?: boolean;
}

type StrengthLevel = "weak" | "medium" | "strong" | "very-strong";

interface Requirement {
    label: string;
    test: (password: string) => boolean;
}

const requirements: Requirement[] = [
    { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
    { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
    { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
    { label: "One number", test: (pwd) => /[0-9]/.test(pwd) },
];

export const PasswordStrengthIndicator = ({
    password,
    showRequirements = true,
}: PasswordStrengthIndicatorProps) => {
    const strength = useMemo((): StrengthLevel => {
        if (!password) return "weak";

        const metRequirements = requirements.filter((req) => req.test(password)).length;
        const length = password.length;

        if (length >= 12 && metRequirements === 4) return "very-strong";
        if (length >= 10 && metRequirements >= 3) return "strong";
        if (length >= 8 && metRequirements >= 2) return "medium";
        return "weak";
    }, [password]);

    const strengthConfig = {
        weak: {
            label: "Weak",
            color: "bg-danger-500",
            textColor: "text-danger-600 dark:text-danger-400",
            width: "25%",
        },
        medium: {
            label: "Medium",
            color: "bg-accent-500",
            textColor: "text-accent-600 dark:text-accent-400",
            width: "50%",
        },
        strong: {
            label: "Strong",
            color: "bg-success-500",
            textColor: "text-success-600 dark:text-success-400",
            width: "75%",
        },
        "very-strong": {
            label: "Very Strong",
            color: "bg-primary-500",
            textColor: "text-primary-600 dark:text-primary-400",
            width: "100%",
        },
    };

    const config = strengthConfig[strength];
    const metRequirements = requirements.filter((req) => req.test(password));

    if (!password && !showRequirements) {
        return null;
    }

    return (
        <div className="space-y-3 animate-fade-in">
            {password && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                            Password strength:
                        </span>
                        <span className={cn("text-sm font-semibold", config.textColor)}>
                            {config.label}
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-light-surface-secondary dark:bg-dark-surface-secondary overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500 ease-out",
                                config.color
                            )}
                            style={{ width: config.width }}
                        />
                    </div>
                </div>
            )}

            {showRequirements && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Requirements:
                    </p>
                    <ul className="space-y-1.5">
                        {requirements.map((requirement, index) => {
                            const isMet = requirement.test(password);
                            return (
                                <li
                                    key={index}
                                    className={cn(
                                        "flex items-center gap-2 text-sm transition-all duration-300",
                                        isMet
                                            ? "text-success-600 dark:text-success-400"
                                            : "text-light-text-muted dark:text-dark-text-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                                            isMet
                                                ? "bg-success-500 text-white scale-100"
                                                : "bg-light-surface-secondary dark:bg-dark-surface-secondary scale-90"
                                        )}
                                    >
                                        {isMet && (
                                            <CheckIcon className="w-3 h-3 animate-scale-in" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "transition-all duration-300",
                                            isMet && "font-medium"
                                        )}
                                    >
                                        {requirement.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

