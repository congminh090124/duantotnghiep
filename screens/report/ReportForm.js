import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {  API_ENDPOINTS, getToken } from '../../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORT_CATEGORIES = [
  { 
    label: 'Spam/Quảng cáo', 
    value: 'spam',
    description: 'Nội dung qung cáo, spam không liên quan',
    icon: 'megaphone-outline'
  },
  { 
    label: 'Quấy rối/Bắt nạt', 
    value: 'harassment',
    description: 'Hành vi quấy rối, bắt nạt người khác',
    icon: 'warning-outline'
  },
  { 
    label: 'Nội dung không phù hợp', 
    value: 'inappropriate_content',
    description: 'Nội dung khiêu dâm, không phù hợp',
    icon: 'alert-circle-outline'
  },
  { 
    label: 'Bạo lực', 
    value: 'violence',
    description: 'Nội dung bạo lực, nguy hiểm',
    icon: 'flame-outline'
  },
  { 
    label: 'Phát ngôn thù địch', 
    value: 'hate_speech',
    description: 'Ngôn từ thù địch, kỳ thị',
    icon: 'chatbox-outline'
  },
  { 
    label: 'Thông tin sai lệch', 
    value: 'false_information',
    description: 'Thông tin không chính xác, gây hiểu lầm',
    icon: 'information-circle-outline'
  },
  { 
    label: 'Khác', 
    value: 'other',
    description: 'Lý do khác',
    icon: 'ellipsis-horizontal-outline'
  }
];

const ReportForm = ({ isVisible, onClose, targetId, targetType, onSubmit }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userID');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error getting userId from AsyncStorage:', error);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setSelectedCategory(null);
    setDescription('');
    onClose();
  }, [onClose]);

  const validateForm = useCallback(() => {
    if (!selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng chọn lý do báo cáo');
      return false;
    }

    if (!description || description.trim().length < 10) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả chi tiết (tối thiểu 10 ký tự)');
      return false;
    }

    if (description.trim().length > 500) {
      Alert.alert('Lỗi', 'Mô tả không được vượt quá 500 ký tự');
      return false;
    }

    if (!targetId || !targetType) {
      Alert.alert('Lỗi', 'Thiếu thông tin đối tượng báo cáo');
      return false;
    }

    return true;
  }, [selectedCategory, description, targetId, targetType]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thực hiện báo cáo');
      }

      const reportData = {
        reportedItem: targetId,
        itemType: targetType,
        reason: selectedCategory,
        description: description.trim()
      };

      console.log('Making report request:', {
        url: API_ENDPOINTS.reports.create,
        data: reportData
      });

      const response = await fetch(API_ENDPOINTS.reports.create, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      const responseData = await response.json();
      console.log('Report response:', {
        status: response.status,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(responseData.message || 'Không thể gửi báo cáo');
      }

      Alert.alert(
        'Thành công',
        'Báo cáo đã được gửi thành công',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              if (onSubmit) onSubmit(responseData);
            }
          }
        ]
      );

      return responseData;

    } catch (error) {
      console.error('Report submission error:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể gửi báo cáo. Vui lòng thử lại sau.'
      );
    }
  }, [targetId, selectedCategory, description, handleClose, validateForm, onSubmit]);

  const slideStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContent, slideStyle]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIndicator} />
                <Text style={styles.modalTitle}>Báo cáo</Text>
              </View>

              <ScrollView style={styles.modalBody}>
                {REPORT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryItem,
                      selectedCategory === category.value && styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory(category.value)}
                  >
                    <View style={styles.categoryContent}>
                      <Ionicons name={category.icon} size={24} color="#666" />
                      <View style={styles.categoryTextContainer}>
                        <Text style={styles.categoryLabel}>{category.label}</Text>
                        <Text style={styles.categoryDescription}>
                          {category.description}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionTitle}>Mô tả chi tiết</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      multiline
                      placeholder="Vui lòng mô tả chi tiết vấn đề (tối thiểu 10 ký tự)"
                      value={description}
                      onChangeText={setDescription}
                      maxLength={500}
                    />
                  </View>
                  <Text style={styles.charCount}>
                    {description.length}/500 ký tự
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    (!selectedCategory || !description.trim()) && styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={!selectedCategory || !description.trim()}
                >
                  <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  categoryItem: {
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCategory: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
  descriptionSection: {
    marginTop: 24,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  input: {
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default React.memo(ReportForm);