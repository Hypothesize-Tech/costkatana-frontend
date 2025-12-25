/**
 * Mixpanel Validator for event validation and data quality
 */
export class MixpanelValidator {
    private static readonly MAX_PROPERTY_NAME_LENGTH = 255;
    private static readonly MAX_PROPERTY_VALUE_LENGTH = 255;
    private static readonly MAX_PROPERTIES_PER_EVENT = 255;
    private static readonly RESERVED_PROPERTIES = [
        'distinct_id',
        'time',
        'ip',
        '$insert_id',
        '$time',
        '$ip'
    ];

    /**
     * Validate an event before sending to Mixpanel
     */
    static validateEvent(event: string, properties: Record<string, any>): boolean {
        if (!event || typeof event !== 'string') {
            console.error('Mixpanel Validation Error: Event name must be a non-empty string');
            return false;
        }

        if (event.length > this.MAX_PROPERTY_NAME_LENGTH) {
            console.error(`Mixpanel Validation Error: Event name exceeds ${this.MAX_PROPERTY_NAME_LENGTH} characters`);
            return false;
        }

        if (!properties || typeof properties !== 'object') {
            console.error('Mixpanel Validation Error: Properties must be an object');
            return false;
        }

        const propertyCount = Object.keys(properties).length;
        if (propertyCount > this.MAX_PROPERTIES_PER_EVENT) {
            console.error(`Mixpanel Validation Error: Too many properties (${propertyCount}), max is ${this.MAX_PROPERTIES_PER_EVENT}`);
            return false;
        }

        // Validate each property
        for (const [key, value] of Object.entries(properties)) {
            if (!this.validateProperty(key, value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate a single property
     */
    private static validateProperty(key: string, value: any): boolean {
        // Check property name length
        if (key.length > this.MAX_PROPERTY_NAME_LENGTH) {
            console.error(`Mixpanel Validation Error: Property name "${key}" exceeds ${this.MAX_PROPERTY_NAME_LENGTH} characters`);
            return false;
        }

        // Check for reserved property names
        if (this.RESERVED_PROPERTIES.includes(key)) {
            console.warn(`Mixpanel Validation Warning: "${key}" is a reserved property name`);
        }

        // Validate property value
        if (value === undefined || value === null) {
            return true; // null and undefined are allowed
        }

        if (typeof value === 'string' && value.length > this.MAX_PROPERTY_VALUE_LENGTH) {
            console.warn(`Mixpanel Validation Warning: Property "${key}" value exceeds ${this.MAX_PROPERTY_VALUE_LENGTH} characters, will be truncated`);
        }

        return true;
    }

    /**
     * Sanitize properties to ensure they meet Mixpanel requirements
     */
    static sanitizeProperties(properties: Record<string, any>): Record<string, any> {
        const sanitized: Record<string, any> = {};

        for (const [key, value] of Object.entries(properties)) {
            // Sanitize key
            let sanitizedKey = key.trim();
            if (sanitizedKey.length > this.MAX_PROPERTY_NAME_LENGTH) {
                sanitizedKey = sanitizedKey.substring(0, this.MAX_PROPERTY_NAME_LENGTH);
            }

            // Sanitize value
            let sanitizedValue = value;

            if (typeof value === 'string') {
                sanitizedValue = value.trim();
                if (sanitizedValue.length > this.MAX_PROPERTY_VALUE_LENGTH) {
                    sanitizedValue = sanitizedValue.substring(0, this.MAX_PROPERTY_VALUE_LENGTH);
                }
            } else if (typeof value === 'object' && value !== null) {
                // Convert objects to JSON string (limited length)
                try {
                    sanitizedValue = JSON.stringify(value);
                    if (sanitizedValue.length > this.MAX_PROPERTY_VALUE_LENGTH) {
                        sanitizedValue = sanitizedValue.substring(0, this.MAX_PROPERTY_VALUE_LENGTH);
                    }
                } catch (error) {
                    console.warn(`Could not serialize property "${key}":`, error);
                    sanitizedValue = '[Complex Object]';
                }
            } else if (typeof value === 'function') {
                // Skip functions
                continue;
            } else if (value === undefined) {
                // Skip undefined
                continue;
            }

            sanitized[sanitizedKey] = sanitizedValue;
        }

        return sanitized;
    }

    /**
     * Check property limits and log warnings
     */
    static checkPropertyLimits(properties: Record<string, any>): void {
        const propertyCount = Object.keys(properties).length;

        if (propertyCount > this.MAX_PROPERTIES_PER_EVENT) {
            console.warn(`Mixpanel Warning: Event has ${propertyCount} properties, exceeds limit of ${this.MAX_PROPERTIES_PER_EVENT}`);
        }

        for (const [key, value] of Object.entries(properties)) {
            if (key.length > this.MAX_PROPERTY_NAME_LENGTH) {
                console.warn(`Mixpanel Warning: Property name "${key}" exceeds ${this.MAX_PROPERTY_NAME_LENGTH} characters`);
            }

            if (typeof value === 'string' && value.length > this.MAX_PROPERTY_VALUE_LENGTH) {
                console.warn(`Mixpanel Warning: Property "${key}" value exceeds ${this.MAX_PROPERTY_VALUE_LENGTH} characters`);
            }
        }
    }

    /**
     * Remove PII (Personally Identifiable Information) from properties
     */
    static removePII(properties: Record<string, any>): Record<string, any> {
        const piiFields = [
            'password',
            'ssn',
            'social_security',
            'credit_card',
            'card_number',
            'cvv',
            'pin',
            'secret',
            'api_key',
            'access_token',
            'private_key'
        ];

        const cleaned: Record<string, any> = {};

        for (const [key, value] of Object.entries(properties)) {
            const lowerKey = key.toLowerCase();
            const isPII = piiFields.some(field => lowerKey.includes(field));

            if (isPII) {
                cleaned[key] = '[REDACTED]';
            } else {
                cleaned[key] = value;
            }
        }

        return cleaned;
    }

    /**
     * Validate user ID
     */
    static validateUserId(userId: string | undefined | null): boolean {
        if (!userId) {
            return false;
        }

        if (typeof userId !== 'string') {
            console.error('Mixpanel Validation Error: User ID must be a string');
            return false;
        }

        if (userId.length === 0) {
            console.error('Mixpanel Validation Error: User ID cannot be empty');
            return false;
        }

        if (userId.length > this.MAX_PROPERTY_VALUE_LENGTH) {
            console.error(`Mixpanel Validation Error: User ID exceeds ${this.MAX_PROPERTY_VALUE_LENGTH} characters`);
            return false;
        }

        return true;
    }

    /**
     * Validate and sanitize event data
     */
    static validateAndSanitize(event: string, properties: Record<string, any>): {
        isValid: boolean;
        sanitizedEvent: string;
        sanitizedProperties: Record<string, any>;
    } {
        // Validate event name
        let sanitizedEvent = event.trim();
        if (sanitizedEvent.length > this.MAX_PROPERTY_NAME_LENGTH) {
            sanitizedEvent = sanitizedEvent.substring(0, this.MAX_PROPERTY_NAME_LENGTH);
        }

        // Sanitize properties
        let sanitizedProperties = this.sanitizeProperties(properties);
        sanitizedProperties = this.removePII(sanitizedProperties);

        // Validate
        const isValid = this.validateEvent(sanitizedEvent, sanitizedProperties);

        return {
            isValid,
            sanitizedEvent,
            sanitizedProperties
        };
    }
}

// Export singleton-like interface
export const mixpanelValidator = MixpanelValidator;

