import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BlockedProfileView = ({ isBlocked, isBlockedBy, onUnblock }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="ban-outline" size={64} color="#666" />
      <Text style={styles.title}>Không thể hiển thị trang cá nhân</Text>
      <Text style={styles.message}>
        {isBlockedBy 
          ? "Bạn đã bị người dùng này chặn"
          : "Bạn đã chặn người dùng này"}
      </Text>
      {isBlocked && (
        <TouchableOpacity
          style={styles.unblockButton}
          onPress={onUnblock}
        >
          <Text style={styles.unblockButtonText}>Bỏ chặn</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#262626',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  unblockButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  unblockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BlockedProfileView;