import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getMyReports } from '../../apiConfig';

const ReportStatus = {
  pending: { label: 'Đang xử lý', color: '#FFA726', icon: 'time-outline' },
  reviewed: { label: 'Đã xem xét', color: '#42A5F5', icon: 'eye-outline' },
  resolved: { label: 'Đã giải quyết', color: '#66BB6A', icon: 'checkmark-circle-outline' },
  rejected: { label: 'Từ chối', color: '#EF5350', icon: 'close-circle-outline' }
};

const ReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchReports = useCallback(async () => {
    try {
      const response = await getMyReports();
      console.log('Reports response:', response);
      if (response.success) {
        setReports(response.data || []);
      } else {
        throw new Error(response.message || 'Không thể tải danh sách báo cáo');
      }
    } catch (error) {
     
      Alert.alert('Lỗi', 'Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const renderReportItem = ({ item }) => {
    const status = ReportStatus[item.status] || ReportStatus.pending;

    return (
      <TouchableOpacity 
        style={styles.reportCard}
        onPress={() => navigation.navigate('ReportDetail', { reportId: item._id })}
      >
        <View style={styles.reportHeader}>
          <View style={styles.typeContainer}>
            <Ionicons 
              name={getReportTypeIcon(item.itemType)} 
              size={20} 
              color="#666"
            />
            <Text style={styles.reportType}>
              {getReportTypeLabel(item.itemType)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon} size={16} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.reportContent}>
          <Text style={styles.reasonText}>
            {getReasonLabel(item.reason)}
          </Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <View style={styles.reportFooter}>
          <Text style={styles.dateText}>
            {formatDate(item.createdAt)}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử báo cáo</Text>
        <View style={{ width: 24 }} />
      </View>

      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportType: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  reportContent: {
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  switch (type) {
    case 'User': return 'Người dùng';
    case 'Post': return 'Bài viết';
    case 'TravelPost': return 'Bài viết du lịch';
    default: return 'Khác';
  }
};

const getReasonLabel = (reason) => {
  const reasons = {
    spam: 'Spam/Quảng cáo',
    inappropriate_content: 'Nội dung không phù hợp',
    harassment: 'Quấy rối/Bắt nạt',
    hate_speech: 'Phát ngôn thù địch',
    false_information: 'Thông tin sai lệch',
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

export default ReportHistory;