import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const API_BASE_URL = 'https://enhanced-remotely-bobcat.ngrok-free.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/users/register`,
  login: `${API_BASE_URL}/api/users/login`,
  showProfile: `${API_BASE_URL}/api/users/thong-tin-ca-nhan`,
  updateAvatar: `${API_BASE_URL}/api/users/update-avatar`,
  posts: `${API_BASE_URL}/api/posts`,
  chats: `${API_BASE_URL}/api/chats`,
  users: `${API_BASE_URL}/api/users/users`,
  // Thêm các endpoint khác ở đây
};

// Hàm tiện ích để lưu token
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.error('Lỗi khi lưu token:', error);
  }
};

// Hàm tiện ích để lấy token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Lỗi khi lấy token:', error);
    return null;
  }
};

// Hàm đăng nhập
export const login = async (credentials) => {
  try {
    console.log('Sending login request to:', API_ENDPOINTS.login);
    const response = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    console.log('Login API response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập không thành công');
    }
    
    return data;
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    throw error;
  }
};

// Hàm đăng ký
export const register = async (userData) => {
  try {
    const response = await fetch(API_ENDPOINTS.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký không thành công');
    }
    
    if (data.token) {
      await saveToken(data.token);
    }
    return data;
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    throw error;
  }
};
export const getUserProfile = async () => {
  try {
    const token = await getToken();
    console.log('Token for getUserProfile:', token);

    if (!token) {
      throw new Error('No token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Thay đổi ở đây
    };
    console.log('Request headers:', headers);

    const response = await fetch(API_ENDPOINTS.showProfile, {
      method: 'GET',
      headers: headers,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.map);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('User profile data:', data);
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin cá nhân:', error);
    throw error;
  }
};
export const updateAvatar = async (imageUri) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No token found');
    }

    // Create form data
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg', // Adjust this based on your image type
      name: 'avatar.jpg',
    });

    const response = await fetch(API_ENDPOINTS.updateAvatar, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};
// Hàm lấy danh sách các post
export const fetchPosts = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.posts);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Hàm tạo post mới
export const createPost = async (postData) => {
  try {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('latitude', postData.latitude);
    formData.append('longitude', postData.longitude);
    formData.append('image', {
      uri: postData.image,
      type: 'image/jpeg',
      name: 'post_image.jpg',
    });

    const response = await apiClient.post(API_ENDPOINTS.posts, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};
export const fetchChatData = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.chats);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat data:', error);
    throw error;
  }
};

export const fetchUsersData = async () => {
  try {
    const token = await getToken(); // Giả sử bạn có hàm getToken
    if (!token) {
      throw new Error('No token found');
    }
    const response = await apiClient.get(API_ENDPOINTS.users, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users data:', error);
    throw error;
  }
};

export default API_ENDPOINTS;