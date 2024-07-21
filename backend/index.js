import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = 4000;
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL_BUILD);

// Using Middlewares
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_BUILD],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.set("trust proxy", 1);
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(cookieParser())

//ROUTES
import user from "./routes/userRoutes.js";

app.use("/api/v1", user);



app.get("/", async (req, res) => {
  try {
    res.send(`SERVER WORKING!`);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).send("Error executing query");
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
