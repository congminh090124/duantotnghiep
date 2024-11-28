import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BlockedProfileView = ({ isBlocked, isBlockedBy, onUnblock, username }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="ban" size={50} color="#666" />
      
      {isBlocked ? (
        <>
          <Text style={styles.title}>Tài khoản bị chặn</Text>
          <Text style={styles.message}>
            Bạn đã chặn {username || 'người dùng này'}. Bỏ chặn để xem trang cá nhân của họ.
          </Text>
          <TouchableOpacity style={styles.unblockButton} onPress={onUnblock}>
            <Text style={styles.unblockText}>Bỏ chặn</Text>
          </TouchableOpacity>
        </>
      ) : isBlockedBy ? (
        <>
          <Text style={styles.title}>Không thể truy cập</Text>
          <Text style={styles.message}>
            {username || 'Người dùng này'} đã chặn bạn. Bạn không thể xem trang cá nhân của họ.
          </Text>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  unblockButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  unblockText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BlockedProfileView;