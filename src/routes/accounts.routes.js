const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  createAccountController,
} = require("../controllers/accounts.controller");

const router = express.Router();

router.post("/", authMiddleware, createAccountController);

module.exports = router;
