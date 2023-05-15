const express = require("express");
const {
  userSignupController,
  verificationOtp,
} = require("../controllers/auth.controller");

const router = express.Router();

router.route("/signup").post(userSignupController);
router.route("/verifyotp").post(verificationOtp);

module.exports = router;
