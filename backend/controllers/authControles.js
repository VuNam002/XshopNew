const User = require("../models/User");
const bcrypt = require("bcryptjs"); // ✅ Đổi thành bcryptjs để match với model
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//[GET]/users/index
module.exports.index = async (req, res) => {
  try {
    const user = await User.find().lean();
    res.status(200).json({
      success: true,
      data: user
    });
  }catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra từ server"
    })
  }
}

module.exports.register = async (req, res) => {
  try {
    const { email, password, userName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    const newUser = new User({
      userName: userName || email.split('@')[0],
      email,
      password: password // Không hash ở đây nữa
    });

    await newUser.save(); // User model sẽ tự hash trong pre('save')
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [POST]/users/login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị tạm ngưng." });
    }

    // ✅ Sử dụng bcryptjs để match với User model
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {


      return res.status(401).json({ message: "Sai mật khẩu" });
    }
    
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        userName: user.userName,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//Lấy thông tin người dùng khi đăng nhập
module.exports.getMe = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      success: true,
      data: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error, success: false });
  }
};

//[PATCH]/admin/auth/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;
  if(!['active', 'inactive'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Trạng thái không hợp lệ. Chỉ chấp nhận 'active' hoặc 'inactive'."
    });
  }

  const user = await User.findOne({
    _id: id,
  });

  user.status = status;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Cập nhật trạng thái thành công",
  })
}

//[DELETE]/admin/auth/detele/:id 
module.exports.delete = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ _id: req.params.id });
    if(!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng để xóa"
      })
    }
    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công"
    })
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xóa người dùng.",
      error: error.message
    })
  }
}

//[PATCH]/admin/auth/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(
      {_id: req.params.id},
      req.body,
      {new: true, runValidators: true}
    );
    if(!updateUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản cập nhật",
      })
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật tài khoản thành công",
      data: updateUser
    })
  } catch(error) {
    console.log("Lỗi khi cập nhật tài khoản: ", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật tài khoản",
      error: error.message
    })
  }
}

//[GET]/users/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id.trim();
    const user = await User.findOne({_id: id});
    if(!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng"
      })
    }
    res.status(200).json(user);
  } catch(error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    })
  }
}

// [PATCH]/admin/auth/change-role/:id
module.exports.changeRole = async (req, res) => {
  try {
    const userId = req.params.id; 
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ." });
    }
    // Lấy danh sách vai trò hợp lệ trực tiếp từ User model
    const allowedRoles = User.schema.path('role').enumValues;
    if (!role || !allowedRoles.includes(role)) { 
      return res.status(400).json({ 
        message: `Vai trò không hợp lệ. Vui lòng cung cấp một trong các giá trị: ${allowedRoles.join(', ')}.`
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role }, 
      { new: true }      
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    res.status(200).json({
      message: "Cập nhật vai trò người dùng thành công.",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Lỗi khi thay đổi vai trò người dùng:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi server." });
  }
};