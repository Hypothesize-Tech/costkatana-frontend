/**
 * Geolocation Service
 * Detects user's country using browser geolocation API with IP-based fallback
 */

const COUNTRY_CACHE_KEY = 'user_country_code';
const COUNTRY_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedCountry {
    code: string;
    timestamp: number;
}

/**
 * Get cached country code from localStorage
 */
function getCachedCountry(): string | null {
    try {
        const cached = localStorage.getItem(COUNTRY_CACHE_KEY);
        if (!cached) return null;

        const data: CachedCountry = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - data.timestamp < COUNTRY_CACHE_DURATION) {
            return data.code;
        }

        // Cache expired, remove it
        localStorage.removeItem(COUNTRY_CACHE_KEY);
        return null;
    } catch (error) {
        console.error('Error reading cached country:', error);
        return null;
    }
}

/**
 * Cache country code in localStorage
 */
function cacheCountry(code: string): void {
    try {
        const data: CachedCountry = {
            code,
            timestamp: Date.now(),
        };
        localStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error caching country:', error);
    }
}

/**
 * Reverse geocode coordinates to country code using OpenStreetMap Nominatim API
 */
async function reverseGeocodeToCountry(latitude: number, longitude: number): Promise<string | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'CostKatana/1.0', // Required by Nominatim
                },
            }
        );

        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }

        const data = await response.json();
        const countryCode = data?.address?.country_code?.toUpperCase();

        if (countryCode && countryCode.length === 2) {
            return countryCode;
        }

        return null;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
    }
}

/**
 * Get country code from IP address using ipapi.co
 */
async function getCountryFromIP(): Promise<string | null> {
    try {
        const response = await fetch('https://ipapi.co/json/', {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('IP geolocation failed');
        }

        const data = await response.json();
        const countryCode = data?.country_code;

        if (countryCode && countryCode.length === 2) {
            return countryCode.toUpperCase();
        }

        return null;
    } catch (error) {
        console.error('Error getting country from IP:', error);
        return null;
    }
}

/**
 * Get user's country code using browser geolocation API
 */
function getCountryFromGeolocation(): Promise<string | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        const options = {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const countryCode = await reverseGeocodeToCountry(latitude, longitude);
                    resolve(countryCode);
                } catch (error) {
                    console.error('Error processing geolocation:', error);
                    resolve(null);
                }
            },
            (error) => {
                // Permission denied or other error, fallback to IP
                console.log('Geolocation error:', error.message);
                resolve(null);
            },
            options
        );
    });
}

/**
 * Detect user's country code
 * Priority: Cache > Browser Geolocation > IP Geolocation > Default (null)
 */
export async function detectUserCountry(): Promise<string | null> {
    // Check cache first
    const cached = getCachedCountry();
    if (cached) {
        return cached;
    }

    let countryCode: string | null = null;

    // Try browser geolocation first
    try {
        countryCode = await getCountryFromGeolocation();
    } catch (error) {
        console.error('Error in browser geolocation:', error);
    }

    // Fallback to IP geolocation if browser geolocation failed
    if (!countryCode) {
        try {
            countryCode = await getCountryFromIP();
        } catch (error) {
            console.error('Error in IP geolocation:', error);
        }
    }

    // Cache the result if we got one
    if (countryCode) {
        cacheCountry(countryCode);
    }

    return countryCode;
}

/**
 * Clear cached country code (useful for testing or when user changes location)
 */
export function clearCountryCache(): void {
    try {
        localStorage.removeItem(COUNTRY_CACHE_KEY);
    } catch (error) {
        console.error('Error clearing country cache:', error);
    }
}

