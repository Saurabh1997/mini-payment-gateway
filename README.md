# Mini Payment Gateway Proxy

A lightweight backend API that simulates routing payment requests to **Stripe** or **PayPal** based on fraud risk scoring, with LLM-generated explanations for each decision.

## 🚀 Features

- **Fraud Risk Detection**: Simple heuristics-based risk scoring
- **Payment Routing**: Automatic routing to Stripe or PayPal based on risk
- **LLM Explanations**: Human-readable explanations for all decisions
- **Transaction Logging**: In-memory storage with timestamps and metadata
- **Input Validation**: Comprehensive validation with detailed error messages
- **RESTful API**: Clean, modern API design with proper error handling
- **Unit Tests**: Comprehensive test coverage for core functionality

## 📋 Requirements Met

✅ **POST /charge** endpoint with proper request/response format  
✅ **Fraud risk score simulation** (0-1 float) with heuristics  
✅ **Payment routing** based on risk score (< 0.5 = route, ≥ 0.5 = block)  
✅ **LLM explanations** for all decisions  
✅ **Transaction logging** in memory with timestamps  
✅ **Input validation** and error handling  
✅ **Unit tests** for core functionality  
✅ **Modern TypeScript** conventions and structure  


## 🏗️ Architecture

```
src/
├── app.ts                 # Express app setup and middleware
├── index.ts              # Server entry point
├── types.ts              # TypeScript interfaces and types
├── routes/
│   ├── charges.ts        # POST /charge endpoint logic
│   └── transactions.ts   # GET /transactions endpoint logic
├── services/
│   ├── fraud.ts          # Fraud detection and risk scoring
│   └── llm.ts            # LLM explanation generation
├── store/
│   └── inMemoryStore.ts  # In-memory transaction storage
└── validators/
    └── charge.ts         # Input validation schemas
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mini-payment-gateway

# Install dependencies
npm install

# Start development server
npm run dev
```

The server will start on `http://localhost:3000`

### Production Build

```bash
# Build the project
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

### POST /charge

Process a payment request with fraud detection and routing.

**Request:**
```json
{
  "amount": 1000,
  "currency": "USD",
  "source": "tok_test",
  "email": "donor@example.com"
}
```

**Response:**
```json
{
  "transactionId": "txn_abc123",
  "provider": "paypal",
  "status": "success",
  "riskScore": 0.32,
  "explanation": "This payment was successfully routed to paypal with a risk score of 0.32. Despite some risk factors, the payment was approved and routed to paypal."
}
```

### GET /transactions

Retrieve transaction history with pagination and filtering.

**Query Parameters:**
- `limit` (default: 50, max: 100)
- `offset` (default: 0)
- `status` (success|failed|blocked)
- `email` (partial match)
- `startDate` & `endDate` (ISO date strings)

**Response:**
```json
{
  "transactions": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /transactions/:id

Get a specific transaction by ID.

### GET /transactions/stats/summary

Get transaction statistics.

### GET /health

Health check endpoint.

## 🕵️ Fraud Detection Logic

The fraud detection system uses simple heuristics to calculate risk scores:

### Risk Factors

1. **Large Amount** (> $10,000): +0.4 to risk score
2. **Suspicious Domains** (.ru, .cn, .test.com, .example.com): +0.3 to risk score
3. **Test Emails** (contains 'test', 'admin', 'root'): +0.2 to risk score
4. **Amount-based Risk**: Linear scaling up to +0.3 based on amount

### Risk Thresholds

- **Risk Score < 0.5**: Route to payment processor
  - Score < 0.3: Route to **Stripe**
  - Score ≥ 0.3: Route to **PayPal**
- **Risk Score ≥ 0.5**: Block transaction

### Example Risk Calculations

```typescript
// Low risk: $100, user@example.com
// Risk Score: ~0.02 (amount-based only)

// Medium risk: $15,000, user@example.com  
// Risk Score: ~0.7 (large amount + amount-based)

// High risk: $20,000, test@test.ru
// Risk Score: ~0.9+ (all factors combined)
```

## 🤖 LLM Integration

The system generates human-readable explanations for all payment decisions using a template-based approach. In a production environment, this would integrate with:

- **OpenAI GPT-4** for dynamic explanations
- **Anthropic Claude** for detailed risk analysis
- **Local LLMs** for privacy-sensitive applications

### Explanation Examples

**Low Risk Success:**
> "This payment was successfully routed to stripe with a risk score of 0.15. Due to the low risk score, the payment was routed to stripe for processing."

**High Risk Blocked:**
> "This payment was blocked due to a high fraud risk score of 0.85. The transaction amount of $15000 exceeds our threshold for large transactions. The email domain from 'test@test.ru' is flagged as potentially suspicious."

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Fraud Detection**: Risk score calculation, factor detection, blocking logic
- **API Endpoints**: Request validation, response formatting, error handling
- **Transaction Storage**: CRUD operations, filtering, pagination
- **Integration**: End-to-end payment flow testing

## 🔧 Configuration

### Environment Variables

```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=development         # Environment mode
```

### Fraud Rules Configuration

Fraud detection rules are currently hardcoded but can be easily externalized:

```typescript
// In src/services/fraud.ts
private readonly LARGE_AMOUNT_THRESHOLD = 10000;
private readonly SUSPICIOUS_DOMAINS = ['.ru', '.cn', '.test.com'];
private readonly TEST_EMAILS = ['test@', 'admin@', 'root@'];
```

## 🚀 Deployment

### Docker (Stretch Goal)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Environment Setup

1. **Development**: Use `npm run dev` for hot reloading
2. **Production**: Build with `npm run build` and start with `npm start`
3. **Testing**: Use `npm test` for continuous integration

## 🤝 Assumptions & Trade-offs

### Assumptions

1. **Payment Processing**: Simulated payment processing (no real Stripe/PayPal integration)
2. **Data Persistence**: In-memory storage (transactions lost on restart)
3. **Security**: Basic validation (production would need authentication/authorization)

### Trade-offs

1. **Simplicity vs. Realism**: Simulated payment processing for demo purposes
2. **Memory vs. Persistence**: In-memory storage for simplicity vs. database for persistence
3. **Performance vs. Features**: Basic implementation vs. advanced features like caching

### Production Considerations

- **Database**: Replace in-memory store with PostgreSQL/MongoDB
- **Authentication**: Add JWT or API key authentication
- **Rate Limiting**: Implement request throttling
- **Monitoring**: Add logging, metrics, and alerting
- **Security**: Add input sanitization, CORS configuration, HTTPS
- **Caching**: Cache LLM responses for performance
- **Queue System**: Use message queues for payment processing

## 📝 Future Enhancements

- [ ] Real payment processor integration (Stripe/PayPal APIs)
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Authentication and authorization
- [ ] Rate limiting and request throttling
- [ ] Comprehensive logging and monitoring
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Webhook support for payment status updates
