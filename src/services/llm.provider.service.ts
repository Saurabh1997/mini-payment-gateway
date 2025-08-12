import OpenAI from 'openai';
import { LLMProvider, RiskSummaryInput } from '../types';

export class OpenAIProvider implements LLMProvider {
    private client: OpenAI;

    constructor(apiKey: string | undefined = process.env.OPENAI_API_KEY) {
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is required to use OpenAIProvider');
        }
        this.client = new OpenAI({ apiKey });
    }

    async generateRiskSummary(input: RiskSummaryInput): Promise<string> {
        const { amount, email, riskScore, factors, provider, status } = input;

        const system =
            'You are a helpful risk analyst. Respond in 1-3 concise sentences in plain English for non-technical users. No JSON.';
        const user = `
Payment decision:
- status: ${status}
- provider: ${provider}
- riskScore: ${riskScore.toFixed(2)}
- amount: $${amount}
- email: ${email}
- factors: ${JSON.stringify(factors)}

Write a short explanation of why this decision was made. Mention only relevant factors.`;

        const resp = await this.client.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.2,
            max_tokens: 160,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user }
            ]
        });

        return resp.choices[0]?.message?.content?.toString().trim() || 'Risk explanation unavailable.';
    }
}


