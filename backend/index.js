const express = require("express");
const connectDb = require("./utils/connectDb.js");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRouter = require("./routes/authRoutes.js");

app.use("/api/", authRouter);

const listenServer = async () => {
  try {
    await connectDb(process.env.MONGO_DB_URL);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server connection error:", error);
  }
};

listenServer();
