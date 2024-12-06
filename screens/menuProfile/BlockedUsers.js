import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getBlockedUsers, unblockUser } from '../../apiConfig';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useSocket } from '../../context/SocketContext';

const BlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { socket } = useSocket();

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await getBlockedUsers();

      if (response && response.success && Array.isArray(response.data)) {
        setBlockedUsers(response.data);
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Không thể lấy danh sách nguời dùng bị chặn');
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng bị chặn');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId, username) => {
    Alert.alert(
      'Xác nhận bỏ chặn',
      `Bạn có chắc chắn muốn bỏ chặn ${username}? Họ sẽ có thể:
      • Nhắn tin cho bạn
      • Gọi video với bạn
      • Xem trạng thái online của bạn`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bỏ chặn',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await unblockUser(userId);
              if (response.success || response.message) {
                // Cập nhật danh sách người bị chặn
                setBlockedUsers(prevUsers => 
                  prevUsers.filter(user => user.id !== userId)
                );
                
                // Thông báo cho socket server về việc bỏ chặn
                if (socket) {
                  socket.emit('user_unblocked', { unblockedUserId: userId });
                }

                Alert.alert('Thành công', `Đã bỏ chặn ${username}`);
              }
            } catch (error) {
              console.error('Error unblocking user:', error);
              Alert.alert('Lỗi', 'Không thể bỏ chặn người dùng này');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.userItem}
        onPress={() => navigation.navigate('ChatScreen', {
            userId: item.id,
            userName: item.username,
            userAvatar: item.avatar,
            blockStatus: {
                isBlocked: true,
                isBlockedBy: false,
                canMessage: false
            }
        })}
    >
        <Image 
            source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
        />
        <View style={styles.userInfo}>
            <Text style={styles.username}>{item.username || 'Người dùng'}</Text>
            <Text style={styles.email}>{item.email || ''}</Text>
            {item.blockedAt && (
                <Text style={styles.blockedDate}>
                    Đã chặn: {format(new Date(item.blockedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </Text>
            )}
        </View>
        <TouchableOpacity 
            style={styles.unblockButton}
            onPress={(e) => {
                e.stopPropagation(); // Ngăn không cho navigate khi bấm nút bỏ chặn
                handleUnblock(item.id, item.username);
            }}
        >
            <Text style={styles.unblockText}>Bỏ chặn</Text>
        </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Người dùng đã chặn</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      ) : blockedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ban-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>
            Bạn chưa chặn người dùng nào
          </Text>
          <Text style={styles.emptySubText}>
            Khi bạn chặn ai đó, họ sẽ không thể:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Nhắn tin cho bạn</Text>
            <Text style={styles.bulletPoint}>• Gọi video với bạn</Text>
            <Text style={styles.bulletPoint}>• Xem trạng thái online của bạn</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  email: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#ff3b30', // Màu đỏ để nhấn mạnh hành động bỏ chặn
  },
  unblockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bulletPoints: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingLeft: 20,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  blockedDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic'
  }
});

export default BlockedUsers;