import mongoose from "mongoose";
import bcrypt from 'bcrypt';


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username bắt buộc phải có!"],
    minlength: [3, "Username ít nhất 3 ký tự!"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email bắt buộc phải có!"],
    match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password bắt buộc phải có!"],
    minlength: [5, "Password ít nhất 5 ký tự!"],
  },

  // 👇 để cùng cấp, không lồng trong password
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});


// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// So sánh password khi login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);

