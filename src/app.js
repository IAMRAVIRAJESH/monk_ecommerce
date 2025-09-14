const express = require("express");

const couponRoutes = require("./routes/couponRoutes");

const app = express();

app.use(
  express.json({
    limit: "10mb",
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

app.use("/api/coupons", couponRoutes);

module.exports = app;
