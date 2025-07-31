function checkRole(requiredRoles) {
    // Đảm bảo requiredRoles luôn là một mảng để xử lý nhất quán
    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    return function (req, res, next) {
        // Gắn sẵn thông tin user từ middleware authToken
        const user = req.user;

        if (!user || !user.role) {
            return res.status(403).json({
                message: "Không xác định được vai trò người dùng.",
                error: true,
                success: false,
            });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                message: "Bạn không có quyền thực hiện hành động này.",
                error: true,
                success: false,
            });
        }

        next(); // hợp lệ thì tiếp tục
    };
}

module.exports = checkRole;
