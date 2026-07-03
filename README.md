# Backend Ledger API

A ledger is a record-keeping system that tracks transactions or entries over time, traditionally used in accounting to log debits and credits against accounts (cash, assets, liabilities, etc.) so you always know balances and history. In software, "ledger" projects usually mean:

- Financial/accounting systems – tracking money in and out, balances, invoices
- Expense/budget trackers – personal or small-business finance apps
- Transaction logs – immutable records of events (used in fintech, blockchain, audit trails)
- Double-entry bookkeeping engines – where every transaction affects two accounts (debit/credit)

## Base URL

- Local: `http://localhost:3000` (or `PORT` you set)

---

## **Auth**

- **Register**
  - Method: POST
  - URL: `https://node-ledger-vk5d.onrender.comhttps://node-ledger-vk5d.onrender.com/api/auth/register`
  - Body:
    ```json
    {
      "name": "Alice",
      "email": "alice@example.com",
      "password": "P@ssw0rd"
    }
    ```

- **Login**
  - Method: POST
  - URL: `https://node-ledger-vk5d.onrender.com/api/auth/login`
  - Body:
    ```json
    {
      "email": "alice@example.com",
      "password": "P@ssw0rd"
    }
    ```

- **Logout**
  - Method: POST
  - URL: `https://node-ledger-vk5d.onrender.com/api/auth/logout`

---

## **Accounts**

- **Create Account**
  - Method: POST
  - URL: `https://node-ledger-vk5d.onrender.com/api/accounts`

- **Get All Accounts**
  - Method: GET
  - URL: `https://node-ledger-vk5d.onrender.com/api/accounts`

- **Get Balance**
  - Method: GET
  - URL: `https://node-ledger-vk5d.onrender.com/api/accounts/:accountId`

---

## **Transactions**

- **Create Transaction**
  - Method: POST
  - URL: `https://node-ledger-vk5d.onrender.com/api/transaction`
  - Body:
    ```json
    {
    "fromAccount":"<from account id>",
    "toAccount":"<to account id>",
    "amount":<amount>,
    "idempotencyKey":"<idempotencyKey>" // unique key
    }
    ```

---

## Install & Run

1. Clone the repo and open it:

```bash
git clone <repo-url>
cd backend-ledger
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with at least the following variables:

```
PORT=
MONGO_URI=
JWT_SECRET=
EMAIL_HOST=s
EMAIL_USER=
EMAIL_PASS=
```

4. Run in development:

```bash
npm run dev
```

5. Run production:

```bash
npm start
```

---

# Thanks for Visiting my project ❤️
