const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const { default: mongoose } = require("mongoose");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

const app = express();
dotenv.config();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

// Connect to mongodb
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("First connection to mongoDB");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected");
});

mongoose.connection.on("connected", () => {
  console.log("mongoDB reconnected");
});

// Enable CORS for all routes
app.use(
  cors({
    origin: [
      "https://asm3-adminecommerce.netlify.app",
      "https://asm3-ecommerce-khoa.netlify.app",
    ],
    credentials: true,
    // Add the following options
    sameSite: "none",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
    secure: true,
  })
);

//middlewares
app.use(express.json());
app.use(cookieParser());

// app.use("/", (req, res, next) => {
//   res.send("success");
// });
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

//error handling
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

app.listen(process.env.PORT || 5000, () => {
  connect();
  console.log(`Server starts at port ${process.env.PORT}`);
});
