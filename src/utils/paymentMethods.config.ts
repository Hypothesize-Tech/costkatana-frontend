/**
 * Payment Methods Configuration
 * Maps country codes to Razorpay payment methods
 */

// EU country codes (ISO 3166-1 alpha-2)
const EU_COUNTRIES = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', // GB included for historical reasons
];

/**
 * Razorpay payment method types
 */
export type RazorpayPaymentMethod = 'card' | 'netbanking' | 'upi' | 'wallet' | 'emi';

/**
 * Get payment methods for a specific country
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'IN', 'US', 'GB')
 * @returns Array of Razorpay payment methods available for that country
 */
export function getPaymentMethodsByCountry(countryCode: string | null): RazorpayPaymentMethod[] {
    if (!countryCode) {
        // Default to cards only if country is unknown
        return ['card'];
    }

    const upperCountryCode = countryCode.toUpperCase();

    // India: All payment methods
    if (upperCountryCode === 'IN') {
        return ['card', 'netbanking', 'upi', 'wallet', 'emi'];
    }

    // US: Cards only (Razorpay supports international cards)
    if (upperCountryCode === 'US') {
        return ['card'];
    }

    // Europe: Cards only (Razorpay supports international cards)
    if (EU_COUNTRIES.includes(upperCountryCode)) {
        return ['card'];
    }

    // Default: Cards only for all other countries
    return ['card'];
}

/**
 * Check if a country supports UPI payments (currently only India)
 */
export function supportsUPI(countryCode: string | null): boolean {
    return countryCode?.toUpperCase() === 'IN';
}

/**
 * Check if a country supports Net Banking (currently only India)
 */
export function supportsNetBanking(countryCode: string | null): boolean {
    return countryCode?.toUpperCase() === 'IN';
}

/**
 * Check if a country supports Wallets (currently only India)
 */
export function supportsWallets(countryCode: string | null): boolean {
    return countryCode?.toUpperCase() === 'IN';
}

/**
 * Check if a country supports EMI (currently only India)
 */
export function supportsEMI(countryCode: string | null): boolean {
    return countryCode?.toUpperCase() === 'IN';
}

/**
 * Get human-readable payment method names
 */
export function getPaymentMethodName(method: RazorpayPaymentMethod): string {
    const names: Record<RazorpayPaymentMethod, string> = {
        card: 'Credit/Debit Card',
        netbanking: 'Net Banking',
        upi: 'UPI',
        wallet: 'Digital Wallet',
        emi: 'EMI',
    };
    return names[method] || method;
}

