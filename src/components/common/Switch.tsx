import { Switch as HeadlessSwitch } from "@headlessui/react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "medium",
}) => {
  const sizes = {
    small: {
      switch: "h-4 w-8",
      button: "h-3 w-3",
      translate: "translate-x-4",
    },
    medium: {
      switch: "h-6 w-11",
      button: "h-4 w-4",
      translate: "translate-x-6",
    },
    large: {
      switch: "h-8 w-14",
      button: "h-6 w-6",
      translate: "translate-x-7",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <HeadlessSwitch.Group>
      <div className="flex items-center justify-between">
        {(label || description) && (
          <div className="flex-1 mr-4">
            {label && (
              <HeadlessSwitch.Label className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                {label}
              </HeadlessSwitch.Label>
            )}
            {description && (
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">{description}</p>
            )}
          </div>
        )}
        <HeadlessSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`${checked ? "bg-gradient-primary shadow-lg glow-primary" : "bg-primary-200/30"
            } relative inline-flex ${sizeConfig.switch} items-center rounded-full transition-all duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
            }`}
        >
          <span className="sr-only">{label || "Toggle"}</span>
          <span
            className={`${checked ? sizeConfig.translate : "translate-x-1"
              } inline-block ${sizeConfig.button} transform rounded-full bg-white shadow-lg transition-all duration-300`}
          />
        </HeadlessSwitch>
      </div>
    </HeadlessSwitch.Group>
  );
};
