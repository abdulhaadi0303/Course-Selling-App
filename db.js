const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// User schema
const User = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

// Admin schema
const Admin = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

// Courses schema
const Course = new Schema({
  title: { type: String, unique: true },
  description: { type: String},
  creatorId: { type: ObjectId, ref: "Admin" }, // Ensure proper reference
  imageUrl: { type: String },
  price: { type: Number },
});

// Purchases schema
const Purchase = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  dateofpurchase: { type: Date, default: Date.now },
});

// Models
const UserModel = mongoose.model("User", User);
const AdminModel = mongoose.model("Admin", Admin);
const CourseModel = mongoose.model("Course", Course);
const PurchaseModel = mongoose.model("Purchase", Purchase);

module.exports = {
  UserModel,
  AdminModel,
  CourseModel,
  PurchaseModel
};
