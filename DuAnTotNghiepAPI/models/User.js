const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
    },
    username: {
        type: String,
    },
    Post: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    avatar: { type: String },
    bio: { type: String },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    sdt: {
        type: String,
        default: ''
    },
    cccd: {
        type: String,
        default: ''
    },

    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    diachi: {
        type: String,
        default: ''
    },
    tuoi: {
        type: Number,
        default: null
    },
    dob: {
        type: String,

    },
    vitrihientai: {
        type: String,
        default: ''
    },
    tinhtranghonnhan: {
        type: String,
        
    },
   
    chieucao: {
        type: Number,
    },
    trangthai: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    xacMinhDanhTinh: {
        type: Boolean,
        default: false
    },
    // Thêm các trường mới
    sex: {
        type: String,

    },
    nationality: {
        type: String,
        default: ''
    },
    home: {
        type: String,
        default: ''
    },

   
}, { timestamps: true });

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Phương thức xác thực mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);