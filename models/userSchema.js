// For mongoDB !!!
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, default: '' },
    email: { type: String, required: true, unique: true, default: '' },
    password: { type: String, required: true, default: '' },
    role: { type: String, enum: ['admin','user'], default: 'user' },
    admin: {
      permissions: {

      },
      lastLogin: { type: Date, default: null },
      loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ip: { type: String },
        device: { type: String }
      }]
    },
  },
  { timestamps: true }
);

// Add method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Add method to check specific admin permissions
userSchema.methods.hasPermission = function(permission) {
  return this.role === 'admin' && this.admin?.permissions?.[permission] === true;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
