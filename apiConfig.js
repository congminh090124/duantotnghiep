import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = 'https://lacewing-evolving-generally.ngrok-free.app';

export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/users/register`,
  login: `${API_BASE_URL}/api/users/login`,
  showProfile: `${API_BASE_URL}/api/users/thong-tin-ca-nhan`,
  showProfileTravel: `${API_BASE_URL}/api/travel-posts`,
  createPostTravel: `${API_BASE_URL}/api/travel-posts/create`,
  updateAvatar: `${API_BASE_URL}/api/users/update-avatar`,
  updateProfile: `${API_BASE_URL}/api/users/update-profile`,
  createPost: `${API_BASE_URL}/api/posts/create-post`,
  showPostWithID:`${API_BASE_URL}/api/posts/post/:id`,
  getUserPosts: `${API_BASE_URL}/api/posts/my-posts`, // Thêm endpoint mới này
  showAllPosts: `${API_BASE_URL}/api/posts/all-posts`,
  showAllPostsMap: `${API_BASE_URL}/api/posts/map-posts`,
   likePost: `${API_BASE_URL}/api/posts/:postId/like`,
   socketURL: `${API_BASE_URL}`,
   onlineUsers: `${API_BASE_URL}/api/all-users`,
   chatHistory: `${API_BASE_URL}/api/chat-history`,
   messages: `${API_BASE_URL}/api/messages`,
   likePost: `${API_BASE_URL}/api/posts/:postId/like`,
   addComment: `${API_BASE_URL}/api/posts/:postId/comments`,
   getComments: `${API_BASE_URL}/api/posts/:postId/comments`,
   followers: `${API_BASE_URL}/api/users/followers`,
  following: `${API_BASE_URL}/api/users/following`,
  forgotPassword: `${API_BASE_URL}/api/users/forgot-password`,
  resetPassword: `${API_BASE_URL}/api/users/reset-password`,
};

// Hàm helper để xử lý response
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }
  return data;
};

// Thêm hàm forgotPassword
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(API_ENDPOINTS.forgotPassword, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    throw error;
  }
};

// Thêm hàm resetPassword
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await fetch(API_ENDPOINTS.resetPassword, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }
    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const getAllTravelPosts = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/travel-posts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch travel posts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAllTravelPosts:', error);
    throw error;
  }
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
// Hàm tạo bài viết mới
export const createPostTravel = async (postData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('startDate', postData.startDate);
    formData.append('endDate', postData.endDate);
    formData.append('currentLocationLat', postData.currentLocationLat);
    formData.append('currentLocationLng', postData.currentLocationLng);
    formData.append('destinationLat', postData.destinationLat);
    formData.append('destinationLng', postData.destinationLng);

    postData.image.forEach((img, index) => {
      formData.append('image', img);
    });

    const response = await fetch(API_ENDPOINTS.createPostTravel, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createPostTravel:', error);
    throw error;
  }
};
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
export const getUserProfileTravel = async () => {
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
export const getAllPostsMap = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.showAllPostsMap, {
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
    console.error('Error in getAllPosts:', error);
    throw error;
  }
};
export const getAllPosts = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.showAllPosts, {
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
    console.error('Error in getAllPosts:', error);
    throw error;
  }
};
export const toggleLikePost = async (postId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.likePost.replace(':postId', postId), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to toggle like. Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Toggle like response:', data);
    return data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};
export const addComment = async (postId, content) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.addComment.replace(':postId', postId), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add comment. Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const response = await fetch(API_ENDPOINTS.getComments.replace(':postId', postId));
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch comments. Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};
export const getUserProfileById = async (userId) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText); // Log the raw response

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getUserPostsWithID = async (userId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/posts/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user posts');
    }

    return data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const followUser = async (userId) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/follow/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/unfollow/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getFeedPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/posts/feed`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Không thể lấy bài viết từ feed');
  }
  return response.json();
};
export const getFollowers = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.followers, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch followers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

export const getFollowing = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(API_ENDPOINTS.following, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch following users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching following users:', error);
    throw error;
  }
};
export default API_ENDPOINTS;