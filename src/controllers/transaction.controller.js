const transactionModel = require("../model/transaction.model");
const ledgerModel = require("../model/ledger.model");
const accountModel = require("../model/accounts.model");
const mongoose = require("mongoose");
const emailService = require("../services/email.service");
// const userModel = require("../model/user.model")

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  const parsedAmount = typeof amount === "string" ? Number(amount) : amount;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount and idempotencyKey is required",
    });
  }

  if (fromAccount === toAccount) {
    return res
      .status(400)
      .json({ message: "fromAccount and toAccount cannot be the same" });
  }
  if (
    typeof parsedAmount !== "number" ||
    Number.isNaN(parsedAmount) ||
    parsedAmount <= 0
  ) {
    return res
      .status(400)
      .json({ message: "amount must be a positive number" });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid from or toAccount",
    });
  }

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(409).json({
        message: "Transaction processing failed, please retry",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(409).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  // check accounts status

  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be active to process transcation",
    });
  }

  const balance = await fromUserAccount.getBalance();

  if (balance < parsedAmount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Request amount is ${parsedAmount}`,
    });
  }

  /**
   * Create transaction (PENDING)
   */
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount: parsedAmount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount: parsedAmount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: parsedAmount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  /**
   * send email notification
   */
  try {
    await emailService.sendTransactionEmail(
      req.user.email,
      req.user.name,
      parsedAmount,
      toAccount,
    );
  } catch (err) {
    console.error("Failed to send transaction email:", err);
  }

  return res.status(200).json({
    message: "Transaction completed",
    transaction,
    debitLedgerEntry,
    creditLedgerEntry,
  });
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  const parsedAmount = typeof amount === "string" ? Number(amount) : amount;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey is required",
    });
  }

  if (
    typeof parsedAmount !== "number" ||
    Number.isNaN(parsedAmount) ||
    parsedAmount <= 0
  ) {
    return res.status(400).json({
      message: "amount must be a positive number",
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message: "Both accounts must be active to process the transaction",
    });
  }

  const balance = await fromUserAccount.getBalance();

  if (balance < parsedAmount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Request amount is ${parsedAmount}`,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await transactionModel.create(
      {
        fromAccount: fromUserAccount._id,
        toAccount,
        amount: parsedAmount,
        idempotencyKey,
        status: "PENDING",
      },
      { session },
    );

    await ledgerModel.create(
      {
        account: fromUserAccount._id,
        amount: parsedAmount,
        transaction: transaction._id,
        type: "DEBIT",
      },
      { session },
    );

    await ledgerModel.create(
      {
        account: toAccount,
        amount: parsedAmount,
        transaction: transaction._id,
        type: "CREDIT",
      },
      { session },
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: "Failed to process initial funds transaction",
      error: error.message,
    });
  }
}
module.exports = { createTransaction, createInitialFundsTransaction };
