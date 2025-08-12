import { v4 as uuidv4 } from 'uuid';
import { ChargeRequest, ChargeResponse, Transaction } from '../types';
import { FraudDetectionService } from './fraud.service';
import { LLMService } from './llm.service';
import { OpenAIProvider } from './llm.provider.service';
import type { LLMProvider } from '../types';
import { InMemoryStore } from '../store/in-memory.store';
import { getFraudConfig } from '../config/fraud.config';

export class ChargeService {
    private fraudService: FraudDetectionService;
    private llmService: LLMService;
    private llmProvider: LLMProvider | null = null;
    private store: InMemoryStore;

    constructor() {
        this.fraudService = new FraudDetectionService();
        this.llmService = new LLMService();
        try {
            if (process.env.OPENAI_API_KEY) {
                this.llmProvider = new OpenAIProvider();
            }
        } catch (e) {
            this.llmProvider = null; // fall back silently
        }
        this.store = new InMemoryStore();
    }

    async processCharge(chargeData: ChargeRequest): Promise<ChargeResponse> {
        // Calculate fraud risk score
        const { score: riskScore, factors } = this.fraudService.calculateRiskScore(
            chargeData.amount,
            chargeData.email
        );
        console.log(" factors ", factors)
        // Determine if transaction should be blocked
        const shouldBlock = this.fraudService.shouldBlockTransaction(riskScore);

        let status: 'success' | 'failed' | 'blocked';
        let provider: 'stripe' | 'paypal';
        let paymentSuccess = false;

        if (shouldBlock) {
            status = 'blocked';
            provider = 'stripe'; // Default, won't be used
        } else {
            // Route to payment processor based on risk score
            const cfg = getFraudConfig();
            provider = riskScore < cfg.thresholds.stripePreferredBelow ? 'stripe' : 'paypal';

            // Simulate payment processing
            paymentSuccess = await this.simulatePaymentProcessing(provider, chargeData);
            status = paymentSuccess ? 'success' : 'failed';
        }

        // Generate explanation using LLM
        const explanation = "risk"
        // const explanation = this.llmProvider
        //     ? await this.llmProvider.generateRiskSummary({
        //         riskScore,
        //         factors,
        //         amount: chargeData.amount,
        //         email: chargeData.email,
        //         provider,
        //         status
        //     })
        //     : this.llmService.generateExplanation(
        //         riskScore,
        //         factors,
        //         chargeData.amount,
        //         chargeData.email,
        //         provider,
        //         status
        //     );

        // Create response
        const transactionId = uuidv4();
        const response: ChargeResponse = {
            transactionId,
            provider,
            status,
            riskScore,
            explanation
        };

        // Log transaction
        const transaction: Transaction = {
            id: transactionId,
            timestamp: new Date(),
            amount: chargeData.amount,
            currency: chargeData.currency,
            email: chargeData.email,
            riskScore,
            provider,
            status,
            explanation
        };

        this.store.addTransaction(transaction);

        return response;
    }

    private async simulatePaymentProcessing(
        provider: 'stripe' | 'paypal',
        chargeData: ChargeRequest
    ): Promise<boolean> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Simulate payment success/failure based on some criteria
        // In a real implementation, this would call actual payment processor APIs

        // For demo purposes, fail payments with very high amounts or suspicious emails
        // if (chargeData.amount > 50000) {
        //     return Math.random() > 0.3; // 70% success rate for very high amounts
        // }

        // if (chargeData.email.includes('test')) {
        //     return Math.random() > 0.5; // 50% success rate for test emails
        // }

        return Math.random() > 0.1; // 90% success rate for normal transactions
    }

    // Get store instance for other routes
    getStore(): InMemoryStore {
        return this.store;
    }
}

