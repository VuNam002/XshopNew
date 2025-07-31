const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Nhớ đúng đường dẫn

async function authToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Vui lòng đăng nhập.", error: true, success: false });
        }

        jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
            if (err) {
                return res.status(403).json({ message: "Token không hợp lệ.", error: true, success: false });
            }

            // Lấy thông tin user từ DB
            const user = await User.findById(decoded._id).select('-password');
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại.", error: true, success: false });
            }

            req.user = user; // Gắn full user vào request
            next();
        });

    } catch (err) {
        res.status(400).json({ message: err.message || err, error: true, success: false });
    }
}

module.exports = authToken;
