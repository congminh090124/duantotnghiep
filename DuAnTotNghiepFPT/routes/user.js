const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const multer = require('multer'); // Để xử lý file upload
const path = require('path');
const authMiddleware = require('../middleware/auth');
router.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    try {
        // Kiểm tra xem email đã tồn tại chưa
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Tạo người dùng mới chỉ với email và mật khẩu, các trường khác dùng giá trị mặc định
        user = new User({
            email,
            password,  // Mật khẩu sẽ được mã hóa tự động nhờ pre-save middleware
            name: '',
            username,
            avatar: '',
            bio: '',
            sdt: '',
            cccd: '',
            ngaysinh: '',
            gioitinh: '',
            thanhpho: '',
            tinhtranghonnhan:'',
        });

        // Lưu người dùng mới
        await user.save();

        // Tạo JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Trả về token và thông tin người dùng
        res.status(201).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          sdt: user.sdt,
          xacMinhDanhTinh: user.xacMinhDanhTinh // Thêm trường này
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  })
router.get('/thong-tin-ca-nhan', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const thongTinNguoiDung = {
            id: user._id,
            ten: user.name,
            username: user.username,
            bio: user.bio,
            anh_dai_dien: user.avatar,
            email: user.email,
            sdt: user.sdt,
            diachi: user.diachi,
            tinhtranghonnhan:user.tinhtranghonnhan,
            sex: user.sex,
            thong_ke: {
                nguoi_theo_doi: user.followersCount,
                dang_theo_doi: user.followingCount,
                bai_viet: user.postsCount
            },
            xac_minh_danh_tinh: user.xacMinhDanhTinh
        };

        res.json(thongTinNguoiDung);
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Thư mục lưu file
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Đặt tên file
    }
});

const upload = multer({ storage: storage });

// Route cập nhật avatar
router.post('/update-avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        const avatarUrl = `/uploads/${req.file.filename}`; // URL của file đã upload

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarUrl },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

            res.send({ avatar: user.avatar });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).send({ message: 'Server error' });
    }
});
router.put('/update-profile', auth, async (req, res) => {
    try {
        const { username, bio, sdt, diachi, sex,tinhtranghonnhan } = req.body;

        // Tìm user theo ID (được cung cấp bởi middleware auth)
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Cập nhật thông tin
        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (sdt) user.sdt = sdt;
        if (diachi) user.diachi = diachi;
        if (sex) user.sex = sex;
        if (tinhtranghonnhan) user.tinhtranghonnhan = tinhtranghonnhan;

        // Lưu các thay đổi
        await user.save();

        // Trả về thông tin đã cập nhật
        res.json({
            message: 'Cập nhật thông tin thành công',
            user: {
                id: user._id,
                username: user.username,
               
                bio: user.bio,
                sdt: user.sdt,
                diachi: user.diachi,
                sex: user.sex,
                email: user.email,
                avatar: user.avatar,
                tinhtranghonnhan:user.tinhtranghonnhan
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
});
router.get('/users', authMiddleware, async (req, res) => {
    try {
        // Lấy tất cả người dùng trừ bản thân và chỉ lấy các trường _id, anhdaidien, trangthai
        const users = await User.find({ _id: { $ne: req.user.id } })
            .select('_id anhdaidien trangthai username');

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
});
module.exports = router;