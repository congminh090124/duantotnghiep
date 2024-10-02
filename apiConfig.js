import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://enhanced-remotely-bobcat.ngrok-free.app';

export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/users/register`,
  login: `${API_BASE_URL}/api/users/login`,
  showProfile: `${API_BASE_URL}/api/users/thong-tin-ca-nhan`,
  updateAvatar: `${API_BASE_URL}/api/users/update-avatar`,
  posts: `${API_BASE_URL}/api/posts`,
  userchats: `${API_BASE_URL}/api/chats/partners`,
  chats: `${API_BASE_URL}/api/chats`,
  users: `${API_BASE_URL}/api/chats/users`,
  sendMessage: `${API_BASE_URL}/api/chats/send`,
  chatHistory: (userId) => `${API_BASE_URL}/api/chats/history/${userId}`,
  updateProfile: `${API_BASE_URL}/api/users/update-profile`,
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
    const response = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
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

// Hàm lấy thông tin người dùng
export const getUserProfile = async () => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('No token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(API_ENDPOINTS.showProfile, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin cá nhân:', error);
    throw error;
  }
};

// Hàm cập nhật avatar
export const updateAvatar = async (imageUri) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
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

// Hàm cập nhật thông tin cá nhân
export const updateProfile = async (profileData) => {
  try {
    const token = await getToken();
    const response = await fetch(API_ENDPOINTS.updateProfile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Hàm lấy danh sách các post
export const fetchPosts = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.posts, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching posts');
    }

    const data = await response.json();
    return data;
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

    const response = await fetch(API_ENDPOINTS.posts, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error creating post');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Hàm lấy dữ liệu chat
export const fetchChatPartners = async () => {
  const token = await getToken();
  if (!token) throw new Error('No token found');

  try {
    const response = await fetch(API_ENDPOINTS.userchats, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error fetching chat partners');

    return await response.json();
  } catch (error) {
    console.error('Error fetching chat partners:', error);
    throw error;
  }
};

// Hàm lấy dữ liệu người dùng
export const fetchUsersData = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(API_ENDPOINTS.users, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching users data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users data:', error);
    throw error;
  }
};

// Lấy lịch sử tin nhắn
export const fetchChatHistory = async (userId) => {
  const token = await getToken();
  if (!token) throw new Error('No token found');

  try {
    const response = await fetch(API_ENDPOINTS.chatHistory(userId), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error fetching chat history');

    return await response.json();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

// Gửi tin nhắn
export const sendMessage = async (receiverId, content) => {
  const token = await getToken();
  if (!token) throw new Error('No token found');

  try {
    const response = await fetch(API_ENDPOINTS.sendMessage, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receiverId, content }),
    });

    if (!response.ok) throw new Error('Error sending message');

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
// Hàm lấy danh sách tất cả người dùng
export const fetchAllUsers = async () => {
  try {
    const token = await getToken();  // Lấy token từ AsyncStorage
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(API_ENDPOINTS.users, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching users');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    throw error;
  }
};

export default API_ENDPOINTS;
