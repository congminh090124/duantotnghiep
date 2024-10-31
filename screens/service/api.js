import axios from 'axios';

const API_URL = 'http://20.2.67.63';

export const scanCCCD = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'cccd.jpg',
    });

    const response = await axios.post(`${API_URL}/api/scan/scan-cccd`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Giả sử API trả về dữ liệu trong response.data.data
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi gọi API scanCCCD:', error);
    throw error;
  }
};