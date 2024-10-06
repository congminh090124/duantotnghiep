import React, { useState, useCallback } from 'react';
import { width,View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { unfollowUser, followUser } from '../../apiConfig';

const API_BASE_URL = 'https://lacewing-evolving-generally.ngrok-free.app';

const Following = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [followingList, setFollowingList] = useState(route.params.following.map(user => ({ ...user, isFollowing: true })));

    const handleUnfollow = useCallback(async (userId, username) => {
        Alert.alert(
            'Xác nhận hủy theo dõi',
            `Bạn có chắc chắn muốn hủy theo dõi ${username}?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel'
                },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        try {
                            await unfollowUser(userId);
                            setFollowingList(prevList =>
                                prevList.map(user =>
                                    user.id === userId ? { ...user, isFollowing: false } : user
                                )
                            );
                        } catch (error) {
                            console.error('Error unfollowing user:', error);
                            Alert.alert('Lỗi', `Không thể hủy theo dõi người dùng: ${error.message}`);
                        }
                    }
                }
            ]
        );
    }, []);

    const handleFollow = useCallback(async (userId) => {
        try {
            await followUser(userId);
            setFollowingList(prevList =>
                prevList.map(user =>
                    user.id === userId ? { ...user, isFollowing: true } : user
                )
            );
        } catch (error) {
            console.error('Error following user:', error);
            Alert.alert('Lỗi', `Không thể theo dõi người dùng: ${error.message}`);
        }
    }, []);

    const getAvatarUri = useCallback((avatarPath) => {
        return avatarPath ? `${API_BASE_URL}${avatarPath}` : null;
    }, []);

    const renderUserItem = useCallback(({ item }) => {
        const avatarUri = getAvatarUri(item.avatar);

        return (
            <View style={styles.userItem}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.username}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.followButton, !item.isFollowing && styles.unfollowButton]}
                    onPress={() => item.isFollowing ? handleUnfollow(item.id, item.username) : handleFollow(item.id)}
                >
                    <Text style={[styles.followButtonText, !item.isFollowing && styles.unfollowButtonText]}>
                        {item.isFollowing ? 'Đang theo dõi' : 'Theo dõi lại'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }, [handleUnfollow, handleFollow, getAvatarUri]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đang theo dõi</Text>
                <View style={{ width: 24 }} />
            </View>
            <FlatList
                data={followingList}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#fff',
    },
    followButton: {
        backgroundColor: '#0066FF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
      },
      unfollowButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#0066FF',
      },
      followButtonText: {
        color: '#fff',
        fontWeight: 'bold',
      },
      unfollowButtonText: {
        color: '#0066FF',
      },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    tab: {
      flex: 1,
      paddingVertical: 15,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#0066FF',
    },
    tabText: {
      fontSize: 16,
      color: 'gray',
    },
    activeTabText: {
      color: '#0066FF',
      fontWeight: 'bold',
    },
    page: {
      width: width,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    userBio: {
      fontSize: 14,
      color: 'gray',
    },
    followButton: {
      backgroundColor: '#0066FF',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    followButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
  export default Following;  