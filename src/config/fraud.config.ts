export interface FraudConfig {
    largeAmountThreshold: number;
    suspiciousDomains: string[];
    testEmailIndicators: string[];
    weights: {
        largeAmount: number;
        suspiciousDomain: number;
        testEmail: number;
    };
    amountRisk: {
        normalizationAmount: number; // Higher amount increases risk up to maxContribution
        maxContribution: number; // Cap on amount-based contribution
    };
    thresholds: {
        block: number; // Block transaction at or above this score
        stripePreferredBelow: number; // Prefer Stripe when risk below this
    };
}

export const fraudConfig: FraudConfig = {
    largeAmountThreshold: 10000,
    suspiciousDomains: ['.ru', '.cn', 'test.com', 'example.com'],
    testEmailIndicators: ['test', 'admin', 'root'],
    weights: {
        largeAmount: 0.4,
        suspiciousDomain: 0.3,
        testEmail: 0.2
    },
    amountRisk: {
        normalizationAmount: 50000,
        maxContribution: 0.3
    },
    thresholds: {
        block: 0.5,
        stripePreferredBelow: 0.3
    }
};

export function getFraudConfig(): FraudConfig {
    return fraudConfig;
}


