const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth')
const User = require('../models/User');

// Cấu hình multer cho việc upload file
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


router.post('/create-post', auth, upload.array('image', 5), async (req, res) => {
  const { title, latitude, longitude, like, comment } = req.body;

  if (!title || !latitude || !longitude) {
    return res.status(400).json({ message: 'Vui lòng nhập đủ tiêu đề, vị trí!' });
  }

  const post = new Post({
    title,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    },
    images: req.files ? req.files.map(file => `/uploads/${file.filename}`) : [],
    like,
    comment,
    user: req.user.id  // Thêm ID của người dùng vào bài viết
  });

  try {
    const savedPost = await post.save();
    
    // Cập nhật mảng Post của người dùng
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { Post: savedPost._id } },
      { new: true }
    );

    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lưu bài viết!', error: err.message });
  }
});



router.get('/my-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    const postsWithFullImageUrls = posts.map(post => ({
      ...post.toObject(),
      images: post.images.map(image => `${req.protocol}://${req.get('host')}${image}`)
    }));

    res.status(200).json(postsWithFullImageUrls);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết của bạn', error: err.message });
  }
});
// Route để hiển thị một bài viết cụ thể
router.get('/post/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username avatar');
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }

    // Tạo URL đầy đủ cho hình ảnh
    const postWithFullImageUrls = {
      ...post.toObject(),
      images: post.images.map(image => `${req.protocol}://${req.get('host')}${image}`),
      
    };

    res.status(200).json(postWithFullImageUrls);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin bài viết', error: err.message });
  }
});

// Route để hiển thị tất cả bài viết kèm thông tin người đăng
router.get('/all-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username avatar') // Populate thông tin người dùng
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    const postsWithFullInfo = posts.map(post => {
      const postObject = post.toObject();
      return {
        ...postObject,
        images: postObject.images.map(image => `${req.protocol}://${req.get('host')}${image}`),
        user: {
          ...postObject.user,
          avatar: postObject.user.avatar ? `${req.protocol}://${req.get('host')}${postObject.user.avatar}` : null
        }
      };
    });

    res.status(200).json(postsWithFullInfo);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết', error: err.message });
  }
});
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Lấy ID người dùng từ token thông qua middleware auth
    const userId = req.user.id; // Đảm bảo rằng middleware auth đặt user.id vào req.user

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Kiểm tra xem người dùng đã like bài viết chưa
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex !== -1) {
      // Nếu đã like, thì unlike
      post.likes.splice(likeIndex, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Nếu chưa like, thì thêm like
      post.likes.push(userId);
      post.likesCount += 1;
    }

    await post.save();

    res.json({ 
      message: likeIndex !== -1 ? 'Post unliked successfully' : 'Post liked successfully', 
      likesCount: post.likesCount,
      likes: post.likes
    });
  } catch (error) {
    console.error('Error processing like:', error);
    res.status(500).json({ message: 'Error processing like', error: error.message });
  }
});
router.get('/map-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .select('title location images user')
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    const mapPosts = posts.map(post => {
      const postObject = post.toObject();
      return {
        id: postObject._id,
        title: postObject.title,
        location: postObject.location,
        thumbnail: postObject.images.length > 0 ? postObject.images[0] : null,
        username: postObject.user.username
      };
    });

    res.status(200).json(mapPosts);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết cho bản đồ', error: err.message });
  }
});
module.exports = router;