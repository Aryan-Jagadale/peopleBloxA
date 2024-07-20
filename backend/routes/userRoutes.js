import express from 'express';
import { login, register,profile,logout } from '../controllers/userController.js';
import { isAuthenticated } from '../middleware/auth.js';


const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(logout);


router.route("/").get(isAuthenticated,profile);



export default router;
