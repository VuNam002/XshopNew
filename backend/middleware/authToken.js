const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Vui lòng đăng nhập.", error: true, success: false });
        }

        // Sử dụng verify đồng bộ trong try...catch để bắt lỗi nhất quán
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy thông tin user từ DB bằng decoded.id
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại.", error: true, success: false });
        }

        req.user = user; // Gắn full user object vào request
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token đã hết hạn. Vui lòng đăng nhập lại.", error: true, success: false });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: "Token không hợp lệ.", error: true, success: false });
        }
        res.status(500).json({ message: "Đã có lỗi xảy ra trong quá trình xác thực.", error: true, success: false, details: err.message });
    }
}

module.exports = authToken;