const { Router } = require("express");
const userRouter = Router();


userRouter.post("/signup", function(req, res) {
    res.json({
        message: "signup endpoint"
    })
})
userRouter.post("/signin", function(req, res) {
    res.json({
        message: "signup endpoint"
    })
})

userRouter.get("/course", function(req, res) {
    res.json({
        message: "Purchased courses endpoint"
    })
})

userRouter.get("/course/all", function(req, res) {
    res.json({
        message: "All courses endpoint"
    })
})


module.exports = {
    userRouter: userRouter
}