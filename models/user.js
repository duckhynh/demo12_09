import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username bắt buộc phải có!"],
    minlength: [3, "Username ít nhất 3 ký tự!"]
  },
  email: {
    type: String,
    required: [true, "Email bắt buộc phải có!"],
    match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ!"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password bắt buộc phải có!"],
    minlength: [5, "Password ít nhất 5 ký tự!"]
  }
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Hash password trước khi save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method so sánh password
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
