import { FraudRiskFactors } from '../types';

export class LLMService {
    generateExplanation(
        riskScore: number,
        factors: FraudRiskFactors,
        amount: number,
        email: string,
        provider: 'stripe' | 'paypal',
        status: 'success' | 'failed' | 'blocked'
    ): string {
        const explanations: string[] = [];

        // Base explanation
        if (status === 'blocked') {
            explanations.push(`This payment was blocked due to a high fraud risk score of ${riskScore.toFixed(2)}.`);
        } else if (status === 'success') {
            explanations.push(`This payment was successfully routed to ${provider} with a risk score of ${riskScore.toFixed(2)}.`);
        } else {
            explanations.push(`This payment failed to process with a risk score of ${riskScore.toFixed(2)}.`);
        }

        // Factor explanations
        if (factors.largeAmount) {
            explanations.push(`The transaction amount of $${amount} exceeds our threshold for large transactions.`);
        }

        if (factors.suspiciousDomain) {
            explanations.push(`The email domain from "${email}" is flagged as potentially suspicious.`);
        }

        if (factors.testEmail) {
            explanations.push(`The email address "${email}" appears to be a test account.`);
        }

        // Provider selection explanation
        if (status === 'success') {
            if (riskScore < 0.2) {
                explanations.push(`Due to the low risk score, the payment was routed to ${provider} for processing.`);
            } else {
                explanations.push(`Despite some risk factors, the payment was approved and routed to ${provider}.`);
            }
        }

        return explanations.join(' ');
    }

    // Alternative method that could integrate with actual LLM APIs
    async generateLLMExplanation(prompt: string): Promise<string> {
        // This would integrate with OpenAI, Anthropic, or other LLM providers
        // For now, we'll use the template-based approach above
        return this.generateExplanation(0.5, {
            largeAmount: false,
            suspiciousDomain: false,
            testEmail: false
        }, 100, 'user@example.com', 'stripe', 'success');
    }
}
