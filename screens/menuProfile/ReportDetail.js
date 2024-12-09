import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getReportDetail } from '../../apiConfig';

const ReportDetail = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { reportId } = route.params;

  const fetchReportDetail = useCallback(async () => {
    try {
      const response = await getReportDetail(reportId);
      if (response && response.data) {
        setReport(response.data);
      } else {
        throw new Error('Invalid report data');
      }
    } catch (error) {
      console.error('Error fetching report detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin báo cáo');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReportDetail();
  }, [fetchReportDetail]);

  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#FFA726',
      reviewed: '#42A5F5',
      resolved: '#66BB6A',
      rejected: '#EF5350'
    };
    return statusColors[status] || '#999';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'Đang xử lý',
      reviewed: 'Đã xem xét',
      resolved: 'Đã giải quyết',
      rejected: 'Từ chối'
    };
    return statusLabels[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy báo cáo</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(report.status) + '20' }]}>
          <Ionicons 
            name={report.status === 'resolved' ? 'checkmark-circle' : 'time'} 
            size={20} 
            color={getStatusColor(report.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
            {getStatusLabel(report.status)}
          </Text>
        </View>

        {/* Report Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin báo cáo</Text>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Loại báo cáo:</Text>
            <Text style={styles.value}>{getReportTypeLabel(report.itemType)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Lý do:</Text>
            <Text style={styles.value}>{getReasonLabel(report.reason)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Thời gian:</Text>
            <Text style={styles.value}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>

        {/* Reported Item Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đối tượng bị báo cáo</Text>
          <View style={styles.reportedItemCard}>
            <View style={styles.reportedItemHeader}>
              {report.reportedItem?.avatar ? (
                <Image 
                  source={{ uri: report.reportedItem.avatar }} 
                  style={styles.reportedItemAvatar}
                />
              ) : (
                <View style={[styles.reportedItemAvatar, styles.defaultAvatar]}>
                  <Ionicons 
                    name={getReportTypeIcon(report.itemType)} 
                    size={24} 
                    color="#666" 
                  />
                </View>
              )}
              <View style={styles.reportedItemInfo}>
                <Text style={styles.reportedItemName}>
                  {report.reportedItem?.name || 
                   report.reportedItem?.title || 
                   'Không có thông tin'}
                </Text>
                <Text style={styles.reportedItemType}>
                  {getReportTypeLabel(report.itemType)}
                </Text>
              </View>
            </View>

            {report.reportedItem?.content && (
              <View style={styles.reportedItemContent}>
                <Text numberOfLines={3} style={styles.reportedItemText}>
                  {report.reportedItem.content}
                </Text>
              </View>
            )}

            {report.reportedItem?.images && report.reportedItem.images.length > 0 && (
              <Image 
                source={{ uri: report.reportedItem.images[0] }}
                style={styles.reportedItemImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
          <Text style={styles.description}>{report.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  value: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  reportedItemCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  reportedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
  },
  reportedItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportedItemInfo: {
    flex: 1,
  },
  reportedItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  reportedItemType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reportedItemContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reportedItemText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  reportedItemImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Helper functions
const getReportTypeIcon = (type) => {
  switch (type) {
    case 'User': return 'person-outline';
    case 'Post': return 'document-text-outline';
    case 'TravelPost': return 'airplane-outline';
    default: return 'alert-circle-outline';
  }
};

const getReportTypeLabel = (type) => {
  const types = {
    'User': 'Người dùng',
    'Post': 'Bài viết',
    'TravelPost': 'Bài viết du lịch',
    'Comment': 'Bình luận'
  };
  return types[type] || type;
};

const getReasonLabel = (reason) => {
  const reasons = {
    spam: 'Spam/Quảng cáo',
    inappropriate_content: 'Nội dung không phù hợp',
    harassment: 'Quấy rối/Bắt nạt',
    hate_speech: 'Phát ngôn thù địch',
    false_information: 'Thông tin sai lệch',
    violence: 'Bạo lực',
    other: 'Lý do khác'
  };
  return reasons[reason] || reason;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default ReportDetail;