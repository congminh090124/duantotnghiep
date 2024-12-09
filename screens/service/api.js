import axios from 'axios';

const API_URL = 'https://moral-simple-lioness.ngrok-free.app';

export const scanCCCD = async (imageUri) => {
  try {
    if (!imageUri) {
      throw new Error('Không tìm thấy ảnh');
    }

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
      timeout: 30000,
      retry: 3,
      retryDelay: (retryCount) => retryCount * 1000,
    });

    if (!response.data || !response.data.data || !response.data.data[0]) {
      throw new Error('Không thể đọc thông tin từ CCCD. Vui lòng thử lại.');
    }

    const cccdData = response.data.data[0];
    
    return {
      cccd: cccdData.id || '',
      name: cccdData.name || '',
      dob: cccdData.dob || '',
      sex: cccdData.sex || '',
      nationality: cccdData.nationality || '',
      home: cccdData.home || '',
      address: cccdData.address || ''
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Quá thời gian kết nối. Vui lòng thử lại.');
      }
      
      if (error.response) {
        switch (error.response.status) {
          case 429:
            throw new Error('Vui lòng đợi một lát rồi thử lại (Too Many Requests)');
          case 400:
            throw new Error('Ảnh không hợp lệ hoặc không đọc được');
          case 401:
            throw new Error('Không có quyền truy cập');
          case 500:
            throw new Error('Lỗi server. Vui lòng thử lại sau');
          default:
            throw new Error(error.response.data.message || 'Lỗi khi quét CCCD');
        }
      }
    }
    
    console.error('Lỗi khi gọi API scanCCCD:', error);
    throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
  }
};