const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    sdt: { type: String, default: '' },
    cccd: { type: String, default: '' },
    ngaysinh: { type: String, default: '' },
    gioitinh: { type: String, default: '' },
    thanhpho: { type: String, default: '' },
    tinhtranghonnhan: { type: String, default: '' },
    xacMinhDanhTinh: { type: Boolean, default: false },
    facebookId: { type: String },
    googleId: { type: String },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    Post: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    sex: { type: String, default: '' },
    nationality: { type: String, default: '' },
    home: { type: String, default: '' },
    diachi: { type: String, default: '' },
    dob: { type: Date },
    chieucao: { type: Number },
}, {
    timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);