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
  name: { type: String, unique: true },
  title: { type: String, unique: true },
  creator_id: ObjectId,
  price: Number,
  imageUrl: String
});

// Purchases schema
const Purchase = new Schema({
  user_id: ObjectId,
  course_id: ObjectId,
  dateofpurchase: Date
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
