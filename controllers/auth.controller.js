const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const {
  signupValidationSchema,
  verificationOtpSchema,
} = require("../validation/auth.validation");

const userSignupController = (req, res) => {
  let { name, email } = req.body;

  const { error } = signupValidationSchema.validate(req.body);
  if (error) {
    return res
      .status(200)
      .json({ error: error.details[0].message, status: false });
  }

  const otp = speakeasy.totp({
    secret: "mysecret", // secret key for generating OTP
    encoding: "base32", // encoding type
    step: 300,
  });

  const expirationTime = Date.now() + 300000;
  console.log(
    "🚀 ~ file: auth.controller.js:27 ~ userSignupController ~ expirationTime:",
    expirationTime
  );

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "brisa.schuppe@ethereal.email",
      pass: "EyPArVDFARR6vHRumj",
    },
  });

  const mailOptions = {
    from: "emraankhaan293@gmail.com",
    to: `${email}`,
    subject: "OTP for authentication",
    text: `Your OTP for authentication is ${otp}`,
  };

  User.findOne({ email })
    .then((usr) => {
      if (!usr) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("OTP sent: " + info.response);
          }
        });

        const user = new User({
          name,
          email,
          password: otp,
          otp,
          otpExpiration: expirationTime,
        });

        user.save();

        return res.status(200).json({
          message: "We sent you an Email Please verify it ",
          data: usr,
        });
      } else {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("OTP sent: " + info.response);
          }
        });
        console.log("🚀 ~ file: auth.controller.js:40 ~ .then ~ usr:", usr);

        usr.otp = otp;
        usr.password = otp;
        usr.otpExpiration = expirationTime;
        usr.save();

        res.status(200).json({
          message: "We sent you an Email Please verify it ",
          // data: usr,
        });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: err, message: "Error Occured due to server" })
    );
};

const verificationOtp = (req, res) => {
  const { email, otp } = req.body;
  const { error } = verificationOtpSchema.validate(req.body);

  if (error) {
    return res
      .status(200)
      .json({ error: error.details[0].message, status: false });
  }

  User.findOne({ email })
    .then((result) => {
      if (!result) {
        return res.status(200).json({
          message: "we didn't find your email Plaese entered true one",
          // data: usr,
        });
      }
      const verified = speakeasy.totp.verify({
        secret: "mysecret",
        encoding: "base32",
        token: otp,
        window: 2, // 2 time steps in either direction (i.e., 1 minute)
        time: Date.now(), // current time
      });

      if (verified && Date.now() < result.otpExpiration) {
        console.log("OTP verified");
        result.otp = null;
        result.isVarified = true;
        result.save();

        const payload = {
          email,
          password: result.password,
        };

        const token = jwt.sign(payload, "mysecretkey");

        // At this stage we will create Jwt Token
        res.status(200).json({ error: err, message: "OTP verified", token });
        // Allow access
      } else {
        console.log("Invalid OTP");
        res.status(200).json({
          error: err,
          message: "Invalid OTP Please enter the correct one",
        });
        // Deny access
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: err, message: "Error Occured due to server" });
    });
};

module.exports = {
  userSignupController,
  verificationOtp,
};
