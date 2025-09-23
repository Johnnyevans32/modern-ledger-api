# Modern Ledger API - TypeScript & TypeORM

A modern accounting API built with TypeScript, Express.js, and TypeORM, implementing Cash Flow Statement and Bank Reconciliation functionality.

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb ledgerapi

# Run the schema and sample data
psql ledgerapi < database.sql
```

### 4. Start Development Server

```bash
# Development with hot reload
npm run dev

# Build and start production
npm run build
npm start

# Type checking only
npm run typecheck
```

## 🌐 API Endpoints

### Cash Flow Statement API

**GET** `/api/cashflow`

**Query Parameters:**

- `companyid` (required): Company ID
- `fromDate` (required): Start date (YYYY-MM-DD)
- `toDate` (required): End date (YYYY-MM-DD)

**Response:**

```typescript
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31",
      "companyId": 1
    },
    "activities": {
      "Operating": {
        "cashInflows": 8000,
        "cashOutflows": 2500,
        "netChange": 5500
      },
      "Financing": {
        "cashInflows": 17000,
        "cashOutflows": 0,
        "netChange": 17000
      },
      "Investing": {
        "cashInflows": 0,
        "cashOutflows": 0,
        "netChange": 0
      }
    },
    "summary": {
      "totalCashInflows": 25000,
      "totalCashOutflows": 2500,
      "netChangeInCash": 22500,
      "closingCashBalance": 22500
    }
  },
  "timestamp": "2025-01-31T12:00:00.000Z"
}
```

### Bank Reconciliation API

**GET** `/api/reconciliation`

**Query Parameters:**

- `companyid` (required): Company ID
- `bankaccount` (required): Bank account name
- `bankStatementBalance` (optional): Current bank statement balance (defaults to 19000)

**Response:**

```typescript
{
  "success": true,
  "data": {
    "companyId": 1,
    "bankAccount": "MainBank",
    "reconciliationDate": "2025-01-31",
    "balances": {
      "ledgerBalance": 22500,
      "bankStatementBalance": 19000,
      "adjustedBankBalance": 22500
    },
    "reconcilingItems": {
      "totalUnreconciledItems": 2,
      "outstandingDeposits": 0,
      "outstandingWithdrawals": 3500,
      "items": [...]
    },
    "reconciliationDifference": 0,
    "isReconciled": true
  },
  "timestamp": "2025-01-31T12:00:00.000Z"
}
```

### Mark Items as Reconciled

**PATCH** `/api/reconciliation/mark-reconciled`

**Request Body:**

```json
{
  "entryIds": [3, 9]
}
```
