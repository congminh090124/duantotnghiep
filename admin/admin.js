import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <nav className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Dashboard</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <Link to="/admin/dashboard">
              <i className="fas fa-home"></i>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/users">
              <i className="fas fa-users"></i>
              Quản lý người dùng
            </Link>
          </li>
          <li>
            <Link to="/admin/posts">
              <i className="fas fa-file-alt"></i>
              Quản lý bài viết
            </Link>
          </li>
          <li>
            <Link to="/admin/reports">
              <i className="fas fa-flag"></i>
              Quản lý báo cáo
            </Link>
          </li>
          <li>
            <Link to="/admin/statistics">
              <i className="fas fa-chart-bar"></i>
              Thống kê
            </Link>
          </li>
        </ul>
      </nav>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
          <div className="header-user">
            <span>Admin</span>
            <button className="logout-btn">Đăng xuất</button>
          </div>
        </header>

        <div className="admin-content">
          <div className="dashboard-cards">
            <div className="card">
              <h3>Tổng người dùng</h3>
              <p className="number">1,234</p>
            </div>
            <div className="card">
              <h3>Bài viết mới</h3>
              <p className="number">56</p>
            </div>
            <div className="card">
              <h3>Báo cáo chờ xử lý</h3>
              <p className="number">23</p>
            </div>
            <div className="card">
              <h3>Truy cập hôm nay</h3>
              <p className="number">789</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;