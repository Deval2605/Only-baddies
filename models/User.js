// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // New: Link to Google Account
  bio: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, required: true },
  dob: { type: Date, required: true },     // New: Date of Birth
  age: { type: Number, required: true },   // New: Calculated Age
  isBaddie: { type: Boolean, default: false },
  aiReason: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // New: Admin or User
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);