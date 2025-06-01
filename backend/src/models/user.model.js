import mongoose, { Schema } from 'mongoose';


const UserSchema = new Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});
const User = mongoose.model('User', UserSchema);

export default User;
