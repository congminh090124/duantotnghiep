import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://enhanced-remotely-bobcat.ngrok-free.app';

export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/users/register`,
  login: `${API_BASE_URL}/api/users/login`,
  showProfile: `${API_BASE_URL}/api/users/thong-tin-ca-nhan`,
  updateAvatar: `${API_BASE_URL}/api/users/update-avatar`,
  updateProfile: `${API_BASE_URL}/api/users/update-profile`,
  createPost: `${API_BASE_URL}/api/posts/create-post`,
  showPostsMap:`${API_BASE_URL}/api/posts/showPostsMap`,
  showPostWithID:`${API_BASE_URL}/api/posts/post/:id`,
  getUserPosts: `${API_BASE_URL}/api/posts/my-posts`, // Thêm endpoint mới này
  
 
  // Thêm các endpoint khác ở đây
};
export const getUserPosts = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.getUserPosts, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    throw error;
  }
};
// Hàm hiển thị bài viết với ID cụ thể
export const showPostWithID = async (postId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.showPostWithID.replace(':id', postId), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in showPostWithID:', error);
    throw error;
  }
};

// Hàm tạo bài viết mới
export const createPost = async (postData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('latitude', postData.location.coordinates[1]);
    formData.append('longitude', postData.location.coordinates[0]);

    postData.image.forEach((img, index) => {
      formData.append('image', img);
    });

    const response = await fetch(API_ENDPOINTS.createPost, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Remove 'Content-Type' header to let the browser set it with the boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
};
// ... existing code ...
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
export const updateProfile = async (profileData) => {
  try {
    const token = await getToken();
    const response = await fetch(API_ENDPOINTS.updateProfile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
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
export const getPosts = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.showPostsMap, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getPosts:', error);
    throw error;
  }
};

export const showPostsMap = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_ENDPOINTS.showPostsMap}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getPost:', error);
    throw error;
  }
};


export default API_ENDPOINTS;