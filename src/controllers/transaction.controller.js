const transactionModel = require("../model/transaction.model");
const ledgerModel = require("../model/ledger.model");
const accountModel = require("../model/accounts.model");
const mongoose = require("mongoose");
const emailService = require("../services/email.service");
// const userModel = require("../model/user.model")

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount and idempotencyKey is required",
    });
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
      return res.status(500).json({
        message: "Transaction processing failed, please retry",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  // check accounts status

  if (fromAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be active to process transcation",
    });
  }

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Request amount is ${amount}`,
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
      amount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
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
      amount,
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

module.exports = { createTransaction };
