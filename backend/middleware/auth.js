import jwt from 'jsonwebtoken';
import { catchAsyncError } from '../utils/catchAsyncError.js';
import ErrorHandler from '../utils/errorHandler.js';


export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new ErrorHandler("Not Logged In", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; 
  next();
});



