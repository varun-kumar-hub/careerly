export interface Country {
    code: string;
    name: string;
    currency: string;
}

export const COUNTRIES: Country[] = [
    { code: 'us', name: 'United States', currency: 'USD' },
    { code: 'in', name: 'India', currency: 'INR' },
    { code: 'gb', name: 'United Kingdom', currency: 'GBP' },
    { code: 'ca', name: 'Canada', currency: 'CAD' },
    { code: 'au', name: 'Australia', currency: 'AUD' },
    { code: 'sg', name: 'Singapore', currency: 'SGD' },
    { code: 'de', name: 'Germany', currency: 'EUR' },
    { code: 'fr', name: 'France', currency: 'EUR' },
    { code: 'nl', name: 'Netherlands', currency: 'EUR' },
];

export const DEFAULT_COUNTRY = 'in'; // Set India as default for this user context, or 'us'
