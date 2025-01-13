require('dotenv').config(); // Make sure this is at the very top
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { z } = require("zod");

const { UserModel, AdminModel, CourseModel, PurchaseModel } = require("./db.js");
const { adminRouter } = require("./routers/adminrouter");
const { userRouter } = require("./routers/userrouter");


const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_PASSWORD;
const JWT_USER_SECRET = process.env.JWT_USER_PASSWORD;
const app = express();
app.use(express.json());

app.use("/user", userRouter);
app.use("/admin", adminRouter);

async function main() {
    let link = process.env.MONGO_URL
    await mongoose.connect(link); // Using process.env.MONGO_URL

    console.log("Connected to DB");
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}

main();
