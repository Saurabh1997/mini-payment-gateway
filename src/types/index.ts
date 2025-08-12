export interface ChargeRequest {
    amount: number;
    currency: string;
    source: string;
    email: string;
}

export interface ChargeResponse {
    transactionId: string;
    provider: 'stripe' | 'paypal';
    status: 'success' | 'failed' | 'blocked';
    riskScore: number;
    explanation: string;
}

export interface Transaction {
    id: string;
    timestamp: Date;
    amount: number;
    currency: string;
    email: string;
    riskScore: number;
    provider: 'stripe' | 'paypal';
    status: 'success' | 'failed' | 'blocked';
    explanation: string;
}

export interface FraudRiskFactors {
    largeAmount: boolean;
    suspiciousDomain: boolean;
    testEmail: boolean;
}

export interface PaymentProcessor {
    name: 'stripe' | 'paypal';
    processPayment(amount: number, currency: string, source: string): Promise<boolean>;
}

export type RiskSummaryInput = {
    riskScore: number;
    factors: FraudRiskFactors;
    amount: number;
    email: string;
    provider: 'stripe' | 'paypal';
    status: 'success' | 'failed' | 'blocked';
};

export interface LLMProvider {
    generateRiskSummary(input: RiskSummaryInput): Promise<string>;
}