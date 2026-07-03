const { Router } = require("express");
const {
  authMiddleware,
  authSystemUserMiddleware,
} = require("../middleware/auth.middleware");
const {
  createTransaction,
  createInitialFundsTransaction,
} = require("../controllers/transaction.controller");

const transactionRoutes = Router();

transactionRoutes.post("/", authMiddleware, createTransaction);
transactionRoutes.post(
  "/system/inital-funds",
  authSystemUserMiddleware,
  createInitialFundsTransaction,
);

module.exports = transactionRoutes;
