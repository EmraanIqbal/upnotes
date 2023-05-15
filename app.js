require("dotenv").config();
const express = require("express");

const connectDB = require("./db/dbConnect");
const errorHandlerMiddleware = require("./middlewares/error-handler.middleware");
const notFoundMiddleware = require("./middlewares/not-found.middleware");
const authRoutes = require("./routes/auth.route");

const app = express();

app.use(express.json());

app.use("/api/v3", authRoutes);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const start = (() => {
  const port = process.env.PORT || 3000;
  connectDB(process.env.MONGO_URI)
    .then(() => {
      app.listen(port, () => console.log(`Listening on Port ${port}`));
    })
    .catch((err) => console.log(err));
})();
