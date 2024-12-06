import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTravelPostDetail, toggleLikeTravelPost } from '../../apiConfig';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReportForm from '../report/ReportForm';

const { width } = Dimensions.get('window');

const Header = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity 
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
    <View style={styles.rightPlaceholder} />
  </View>
);

const TravelPostDetail = ({ route, navigation }) => {
  const { postId, currentUserId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [locationName, setLocationName] = useState('Đang tải địa điểm...');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const fetchPostData = useCallback(async () => {
    try {
      setLoading(true);
      const postData = await getTravelPostDetail(postId);
      setPost(postData);
      
      if (postData && currentUserId) {
        setIsLiked(postData.likes?.includes(currentUserId));
        setLikeCount(postData.likes?.length || 0);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin bài viết');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [postId, navigation, currentUserId]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  const handleLike = async () => {
    if (isLikeLoading || !currentUserId) return;

    try {
      setIsLikeLoading(true);
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

      const response = await toggleLikeTravelPost(postId);
      
      if (response.success) {
        setIsLiked(response.isLiked);
        setLikeCount(response.likesCount);
      } else {
        setIsLiked(!newIsLiked);
        setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
        Alert.alert('Thông báo', response.message || 'Không thể thực hiện thao tác này');
      }
    } catch (error) {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác này');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const renderLikeButton = () => (
    <View style={styles.likeContainer}>
      <TouchableOpacity 
        style={styles.likeButton}
        onPress={handleLike}
        disabled={isLikeLoading}
      >
        <Ionicons 
          name={isLiked ? "heart" : "heart-outline"} 
          size={28}
          color={isLiked ? "#FF6B6B" : "#757575"} 
        />
      </TouchableOpacity>
      <Text style={styles.likeCount}>
        {likeCount} lượt thích
      </Text>
    </View>
  );

  const getLocationName = useCallback(async (coordinates) => {
    try {
      if (!coordinates?.length) {
        setLocationName('Không có địa điểm');
        return;
      }

      const [longitude, latitude] = coordinates;
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (response && response[0]) {
        const location = response[0];
        const address = [
          location.street,
          location.district,
          location.city,
          location.region,
          location.country
        ]
          .filter(Boolean)
          .join(', ');
        setLocationName(address);
      } else {
        setLocationName('Không thể xác định địa điểm');
      }
    } catch (error) {
      setLocationName('Lỗi khi tải địa điểm');
    }
  }, []);

  useEffect(() => {
    if (post?.destination?.coordinates) {
      getLocationName(post.destination.coordinates);
    }
  }, [post, getLocationName]);

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const handleReportPress = useCallback(() => {
    setIsMenuVisible(false);
    setTimeout(() => {
      setIsReportVisible(true);
    }, 300);
  }, []);

  const renderAuthorSection = () => (
    <View style={styles.authorContainer}>
      <Image
        source={{ uri: post.author?.avatar }}
        style={styles.authorAvatar}
      />
      <Text style={styles.authorName}>{post.author?.username}</Text>
      {post.author?.id !== currentUserId && (
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={handleMenuPress}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy bài viết</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header navigation={navigation} />
      <ScrollView>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const offset = e.nativeEvent.contentOffset.x;
              setCurrentImageIndex(Math.round(offset / width));
            }}
            scrollEventThrottle={16}
          >
            {post.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {post.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{post.title}</Text>

          {renderAuthorSection()}

          {renderLikeButton()}

          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Địa điểm</Text>
            <View style={styles.locationContent}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.locationText}>{locationName}</Text>
            </View>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.sectionTitle}>Thời gian</Text>
            <View style={styles.dateContent}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateText}>
                {new Date(post.startDate).toLocaleDateString()} - 
                {new Date(post.endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {post.interests && post.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {post.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        transparent
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleReportPress}
            >
              <Ionicons name="warning-outline" size={24} color="#FF3B30" />
              <Text style={styles.menuText}>Báo cáo bài viết</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Form */}
      <ReportForm
        isVisible={isReportVisible}
        onClose={() => setIsReportVisible(false)}
        targetId={postId}
        targetType="TravelPost"
        onSubmit={() => setIsReportVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  imageContainer: {
    width: width,
    height: width * 0.8,
    position: 'relative',
  },
  image: {
    width: width,
    height: width * 0.8,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
  },
  likeButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  locationContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#262626',
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#262626',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightPlaceholder: {
    width: 40, // Để cân bằng với backButton
  },
  moreButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#FF3B30',
  },
});

export default TravelPostDetail; 