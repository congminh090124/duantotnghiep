import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFollowing, unfollowUser } from '../../apiConfig';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = 60;

const Following = ({ route, navigation }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingIds, setUnfollowingIds] = useState(new Set());
  const { userId } = route.params;

  useEffect(() => {
    fetchFollowing();
  }, [userId]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const data = await getFollowing(userId);
      const formattedData = (data || []).map((item, index) => ({
        ...item,
        uniqueId: item.id || item._id || index.toString(),
        avatar: item.avatar,
        username: item.username || 'Người dùng',
        fullName: item.ten_day_du || '',
        bio: item.bio || ''
      }));
      setFollowing(formattedData);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId, username) => {
    try {
      setUnfollowingIds(prev => new Set(prev).add(userId));
      await unfollowUser(userId);
      
      setFollowing(prev => prev.filter(user => user.uniqueId !== userId));
      
    } catch (error) {
      console.error('Error unfollowing user:', error);
      Alert.alert('Lỗi', 'Không thể bỏ theo dõi người dùng này');
    } finally {
      setUnfollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigation.navigate('UserProfile', { userId: item.uniqueId })}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatar}
            defaultSource={require('../../assets/image.png')}
          />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Text style={styles.placeholderText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username} numberOfLines={1}>
          {item.username}
        </Text>
        {item.fullName && (
          <Text style={styles.fullName} numberOfLines={1}>
            {item.fullName}
          </Text>
        )}
        {item.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.unfollowButton, unfollowingIds.has(item.uniqueId) && styles.unfollowingButton]}
        onPress={() => {
          Alert.alert(
            'Bỏ theo dõi',
            `Bạn có chắc muốn bỏ theo dõi ${item.username}?`,
            [
              { text: 'Hủy', style: 'cancel' },
              { 
                text: 'Bỏ theo dõi', 
                style: 'destructive',
                onPress: () => handleUnfollow(item.uniqueId, item.username)
              }
            ]
          );
        }}
        disabled={unfollowingIds.has(item.uniqueId)}
      >
        {unfollowingIds.has(item.uniqueId) ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <Text style={styles.unfollowButtonText}>Đang theo dõi</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={48} color="#666" />
      <Text style={styles.emptyText}>Chưa theo dõi ai</Text>
      <Text style={styles.emptySubText}>
        Hãy khám phá và kết nối với những người dùng khác
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đang theo dõi</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đang theo dõi</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={following}
        renderItem={renderItem}
        keyExtractor={item => item.uniqueId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#f0f0f0',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: AVATAR_SIZE + 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  unfollowButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  unfollowingButton: {
    opacity: 0.7,
  },
  unfollowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
});

export default Following;