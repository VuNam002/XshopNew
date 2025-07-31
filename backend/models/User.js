const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Thư viện để mã hóa mật khẩu

const UserSchema = new mongoose.Schema({
    userName: { type: String, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 }, // Thêm yêu cầu độ dài tối thiểu cho mật khẩu
    
    // Thông tin cá nhân
    fullName: { type: String, trim: true },
    phone: String,
    address: {
        street: String,
        city: String,
        district: String,
        ward: String
    },
    
    // Phân quyền và trạng thái
    role: {
        type: String,
        enum: [ 'customer', 'staff', 'admin'],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'active'
    },
    
    // Metadata
    lastLogin: Date,
    emailVerified: { type: Boolean, default: false }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Middleware (pre-save hook) để hash mật khẩu trước khi lưu vào DB
UserSchema.pre('save', async function(next) {
    // Chỉ hash mật khẩu nếu nó đã được thay đổi (hoặc là người dùng mới)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model('users', UserSchema);

module.exports = User;