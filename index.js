const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {z} = require("zod");

const {adminRouter} = require("./routers/adminrouter");
const { userRouter } = require("./routers/userrouter");

const JWT_SECRET = "asdfj230sdh2@3%";
const app = express();
app.use(express.json());
// mongoose.connect("");


app.use("/user",userRouter)
app.use("/admin",adminRouter)



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});