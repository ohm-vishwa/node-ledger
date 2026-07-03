# Backend Ledger API

A ledger is a record-keeping system that tracks transactions or entries over time, traditionally used in accounting to log debits and credits against accounts (cash, assets, liabilities, etc.) so you always know balances and history. In software, "ledger" projects usually mean:

- Financial/accounting systems – tracking money in and out, balances, invoices
- Expense/budget trackers – personal or small-business finance apps
- Transaction logs – immutable records of events (used in fintech, blockchain, audit trails)
- Double-entry bookkeeping engines – where every transaction affects two accounts (debit/credit)

## Live URL : https://node-ledger-vk5d.onrender.com/

## Base URL

- Local: `http://localhost:3000` (or `PORT` you set)

---

## **Auth**

- **Register**
  - Method: POST
  - URL: `/api/auth/register`
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
  - URL: `/api/auth/login`
  - Body:
    ```json
    {
      "email": "alice@example.com",
      "password": "P@ssw0rd"
    }
    ```

- **Logout**
  - Method: POST
  - URL: `/api/auth/logout`

---

## **Accounts**

- **Create Account**
  - Method: POST
  - URL: `/api/accounts`
  - Body:
    ```json
    {
      "userId": "<userId>",
      "name": "Checking",
      "currency": "USD",
      "balance": 1000.0
    }
    ```

- **Get All Accounts**
  - Method: GET
  - URL: `/api/accounts`

- **Get Balance**
  - Method: GET
  - URL: `/api/accounts/balance/:accountId`

---

## **Transactions**

- **Create Transaction**
  - Method: POST
  - URL: `/api/transaction`
  - Body:
    ```json
    {
      "fromAccount": "<from account id>",
      "toAccount": "<to account id>",
      "amount": 100.0,
      "idempotencyKey": "<unique-key>"
    }
    ```

- **Create Initial Funds (SYSTEM user only)**
  - Method: POST
  - URL: `/api/transaction/system/initial-funds`
  - Headers:
    - `Authorization: Bearer <system-user-token>`
  - Body:
    ```json
    {
      "toAccount": "<account id>",
      "amount": 5000.0,
      "idempotencyKey": "<unique-key>"
    }
    ```
  - Notes:
    - This route is protected by `authSystemUserMiddleware`.
    - The authenticated user must have `systemUser: true`.
    - The transaction uses the system user's own account as the source account.

---

## System user / Initial funds

- A SYSTEM user is a special user with the `systemUser` flag enabled in the user model.
- Only this user can access `/api/transaction/system/initial-funds`.
- If your app does not expose a public route to create SYSTEM users, create or seed the user directly in the database with `systemUser: true`.
- Then login as that SYSTEM user, copy the returned JWT token, and use it in the `Authorization` header to fund accounts.

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
