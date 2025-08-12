import type { FraudRiskFactors } from '../types';
import { getFraudConfig } from '../config/fraud.config';

export class FraudDetectionService {
    private readonly config = getFraudConfig();

    calculateRiskScore(amount: number, email: string): { score: number; factors: FraudRiskFactors } {
        const factors: FraudRiskFactors = {
            largeAmount: amount > this.config.largeAmountThreshold,
            suspiciousDomain: this.isSuspiciousDomain(email),
            testEmail: this.isTestEmail(email)
        };

        let score = 0.0;

        // Large amount penalty
        if (factors.largeAmount) score += this.config.weights.largeAmount;

        // Suspicious domain penalty
        if (factors.suspiciousDomain) score += this.config.weights.suspiciousDomain;

        // Test email penalty
        if (factors.testEmail) score += this.config.weights.testEmail;

        // Amount-based risk (higher amounts = higher risk)
        const amountRisk = Math.min(
            amount / this.config.amountRisk.normalizationAmount,
            this.config.amountRisk.maxContribution
        );
        score += amountRisk;

        return {
            score: Math.min(score, 1.0), // Cap at 1.0
            factors
        };
    }

    private isSuspiciousDomain(email: string): boolean {
        const domain = email.split('@')[1]?.toLowerCase() || '';
        return this.config.suspiciousDomains.some(suspicious => domain.includes(suspicious));
    }

    private isTestEmail(email: string): boolean {
        const localPart = email.split('@')[0]?.toLowerCase() || '';
        return this.config.testEmailIndicators.some(test => localPart.includes(test));
    }

    shouldBlockTransaction(riskScore: number): boolean {
        return riskScore >= this.config.thresholds.block;
    }
}
