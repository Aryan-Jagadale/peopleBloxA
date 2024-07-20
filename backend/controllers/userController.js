import { catchAsyncError } from "../utils/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pkg from "pg";
const { Client } = pkg;
import fs from "fs"
import { config } from "../config.js";


const client = new Client(config);

client.connect((err) => {
  if (err) {
    console.error("Failed to connect to the database", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

const options = {
  expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const register = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please add all fields", 400));
  }

  const userQuery = "SELECT * FROM users WHERE email = $1";
  const existingUser = await client.query(userQuery, [email]);

  if (existingUser.rows.length > 0) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertQuery =
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *";
  const newUser = await client.query(insertQuery, [email, hashedPassword]);

  const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res
    .status(201)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        email: newUser.rows[0].email,
      },
    });
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    return next(new ErrorHandler("Please add all fields", 400));
  }

  const userQuery = "SELECT * FROM users WHERE email = $1";
  const userResult = await client.query(userQuery, [email]);
  const user = userResult.rows[0];

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  if (
    user.account_locked_until &&
    new Date(user.account_locked_until) > new Date()
  ) {
    return next(new ErrorHandler("Account is locked. Try again later.", 403));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const now = new Date();
    const lastFailedLogin = new Date(user.last_failed_login);
    // console.log("last", lastFailedLogin);

    const twelveHoursAgo = new Date(now - 12 * 60 * 60 * 1000);
    // console.log("12", twelveHoursAgo);

    let failedLoginAttempts = user.failed_login_attempts;
    // console.log("failedLoginAttempts", failedLoginAttempts);

    if (lastFailedLogin > twelveHoursAgo) {
      failedLoginAttempts += 1;
    } else {
      failedLoginAttempts = 1;
    }

    if (failedLoginAttempts >= 5) {
      const lockUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await client.query(
        "UPDATE users SET failed_login_attempts = $1, last_failed_login = $2, account_locked_until = $3 WHERE email = $4",
        [failedLoginAttempts, now, lockUntil, email]
      );
      return next(
        new ErrorHandler(
          "Account is locked for 24 hours due to multiple failed login attempts.",
          403
        )
      );
    } else {
      await client.query(
        "UPDATE users SET failed_login_attempts = $1, last_failed_login = $2 WHERE email = $3",
        [failedLoginAttempts, now, email]
      );
      return next(new ErrorHandler("Invalid email or password", 401));
    }
  }

  await client.query(
    "UPDATE users SET failed_login_attempts = 0, last_failed_login = NULL, account_locked_until = NULL WHERE email = $1",
    [email]
  );

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  // console.log("token",token);

  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        email: user.email,
      },
    });
});

export const profile = catchAsyncError(async (req, res, next) => {
  const userQuery = "SELECT * FROM users WHERE id = $1";
  client.query(userQuery, [req.user.id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const user = result.rows[0];
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
});

export const logout = catchAsyncError(async (req, res, next) => {
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  res.status(200).cookie("token", null, options).json({
    success: true,
    message: "Logged Out Successfully",
  });
});