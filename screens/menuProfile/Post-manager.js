import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import TravelPostManager from './TravelPostManager';
import BlogPostManager from './BlogPostManager';

const PostManager = () => {
  const [activeTab, setActiveTab] = useState('travel');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const travelManagerRef = useRef(null);
  const blogManagerRef = useRef(null);

  const handleTabChange = useCallback(async (tab) => {
    setIsRefreshing(true);
    setActiveTab(tab);
    try {
      if (tab === 'travel') {
        await travelManagerRef.current?.refreshPosts();
      } else {
        await blogManagerRef.current?.refreshPosts();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Hiển thị thông báo lỗi nếu cần
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const renderTopNav = () => (
    <View style={styles.topNav}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'travel' && styles.activeTab]}
        onPress={() => handleTabChange('travel')}
        disabled={isRefreshing}
      >
        <Text style={[styles.tabText, activeTab === 'travel' && styles.activeTabText]}>
          {isRefreshing && activeTab === 'travel' ? 'Đang tải...' : 'Quản lý Travel'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'blog' && styles.activeTab]}
        onPress={() => handleTabChange('blog')}
        disabled={isRefreshing}
      >
        <Text style={[styles.tabText, activeTab === 'blog' && styles.activeTabText]}>
          {isRefreshing && activeTab === 'blog' ? 'Đang tải...' : 'Quản lý Blog'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'travel') {
      return <TravelPostManager ref={travelManagerRef} />;
    } else {
      return <BlogPostManager ref={blogManagerRef} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderTopNav()}
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  activeTabText: {
    color: '#007bff',
  },
});

export default PostManager;
