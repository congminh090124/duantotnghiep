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
              style={styles.tabItem}
            >
              <Text 
                style={[
                  styles.tabBarLabel,
                  {
                    opacity: isFocused ? 1 : 0.7,
                    transform: [{ scale: isFocused ? 1 : 0.95 }]
                  }
                ]}
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
    backgroundColor: '#000',
  },
  sceneContainer: {
    backgroundColor: '#000',
  },
  tabBarContainer: {
    backgroundColor: '#000',
    paddingTop: 8,
    height: Platform.select({
      ios: 'auto',
      android: TAB_BAR_HEIGHT,
    }),
    justifyContent: Platform.select({
      ios: 'flex-start',
      android: 'flex-end',
    }),
    paddingBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    height: Platform.select({
      ios: 45,
      android: TAB_BAR_HEIGHT * 0.5,
    }),
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.select({
      ios: 8,
      android: 0,
    }),
  },
  tabBarLabel: {
    color: '#fff',
    fontSize: Platform.select({
      ios: 14,
      android: SCREEN_WIDTH * 0.04,
    }),
    textTransform: 'none',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default React.memo(TopTabNavigator);