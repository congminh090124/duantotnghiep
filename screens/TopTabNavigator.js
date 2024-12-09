import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TrangTimBanDuLich from './TrangChu/TrangTimBanDuLich';
import MapScreen from './TrangChu/MapScreen';
import Blog from './blog/Blog';

const TopTab = createMaterialTopTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.select({
  ios: 45, // Giữ nguyên chiều cao cũ cho iOS
  android: SCREEN_HEIGHT * -0.1 // 10% chiều cao màn hình cho Android
});

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive
              ]}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.tabBarLabel,
                  isFocused && styles.tabBarLabelActive
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TopTabNavigator = () => {
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup khi unmount
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopTab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          swipeEnabled: true,
          lazy: true,
          tabBarStyle: Platform.select({
            android: {
              height: TAB_BAR_HEIGHT,
            },
            ios: undefined, // Giữ nguyên mặc định cho iOS
          }),
        }}
        initialLayout={{
          width: SCREEN_WIDTH
        }}
        sceneContainerStyle={styles.sceneContainer}
      >
        <TopTab.Screen 
          name="Trang chủ" 
          component={TrangTimBanDuLich}
          options={{
            tabBarLabel: "Trang chủ"
          }}
        />
        <TopTab.Screen 
          name="Feed" 
          component={Blog}
          options={{
            tabBarLabel: "Feed"
          }}
        />
        <TopTab.Screen 
          name="Bản đồ" 
          component={MapScreen}
          options={{
            tabBarLabel: "Bản đồ"
          }}
        />
      </TopTab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sceneContainer: {
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'ios' ? 40 : TAB_BAR_HEIGHT,
  },
  tabBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 6 : 2,
    height: Platform.select({
      ios: 'auto',
      android: TAB_BAR_HEIGHT * 0.8,
    }),
    justifyContent: Platform.select({
      ios: 'flex-start',
      android: 'flex-end',
    }),
    paddingBottom: Platform.OS === 'ios' ? 6 : 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: Platform.select({
      ios: 36,
      android: TAB_BAR_HEIGHT * 0.4,
    }),
    alignItems: 'center',
    paddingHorizontal: 8,
    marginHorizontal: Platform.OS === 'ios' ? 12 : 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: Platform.select({
      ios: 8,
      android: 6,
    }),
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabBarLabel: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: Platform.select({
      ios: 15,
      android: SCREEN_WIDTH * 0.035,
    }),
    textTransform: 'none',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  tabBarLabelActive: {
    color: '#000',
    fontWeight: '600',
  },
  tabItemActive: {
    backgroundColor: '#f5f5f5',
  }
});

export default React.memo(TopTabNavigator);