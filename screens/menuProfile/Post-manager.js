import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import TravelPostManager from './TravelPostManager';
import BlogPostManager from './BlogPostManager';

const PostManager = () => {
  const [activeTab, setActiveTab] = useState('travel');

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const renderTopNav = () => (
    <View style={styles.topNav}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'travel' && styles.activeTab]}
        onPress={() => handleTabChange('travel')}
      >
        <Text style={[styles.tabText, activeTab === 'travel' && styles.activeTabText]}>
          Quản lý Travel
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'blog' && styles.activeTab]}
        onPress={() => handleTabChange('blog')}
      >
        <Text style={[styles.tabText, activeTab === 'blog' && styles.activeTabText]}>
          Quản lý Blog
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'travel') {
      return <TravelPostManager />;
    } else {
      return <BlogPostManager />;
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
