import React from 'react';
import { 
  StyleSheet, 
  Image, 
  Dimensions, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Onboarding from 'react-native-onboarding-swiper';
import { StatusBar } from 'expo-status-bar';
import { Image as ExpoImage } from 'expo-image'; // Optimized image component

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();

  // Memoized Dot Component with React.useCallback for performance
  const DotComponent = React.useCallback(({ selected }) => {
    return (
      <View
        style={{
          width: selected ? 28 : 8,
          height: 8,
          borderRadius: 4,
          marginHorizontal: 3,
          backgroundColor: selected ? '#FF385C' : 'rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s',
        }}
      />
    );
  }, []);

  // Memoized Next Button Component
  const NextButtonComponent = React.useCallback(({ scrollTo }) => {
    return (
      <TouchableOpacity 
        style={[styles.navigationButton, styles.rightButton]} 
        onPress={scrollTo}
      >
        <Text style={styles.navigationButtonText}>→</Text>
      </TouchableOpacity>
    );
  }, []);

  // Memoized Done Button Component
 

  // Memoized Skip Button Component
  const SkipButtonComponent = React.useCallback(({ scrollTo }) => {
    return (
      <TouchableOpacity 
        style={[styles.navigationButton, styles.leftButton]} 
        onPress={scrollTo}
      >
        <Text style={styles.navigationButtonText}>←</Text>
      </TouchableOpacity>
    );
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Onboarding
        pages={[
          {
            backgroundColor: '#000',
            image: (
              <View style={styles.imageContainer}>
                <ExpoImage
                  source={require('../assets/slide1.jpg')}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                  accessible={true}
                  accessibilityLabel="Slide 1 image"
                />
                <View style={styles.overlay} />
              </View>
            ),
            title: 'Tìm Người Đồng Hành',
            subtitle: 'Kết nối với những người có cùng đam mê xê dịch như bạn',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#000',
            image: (
              <View style={styles.imageContainer}>
                <ExpoImage
                  source={require('../assets/slide2.jpeg')}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                  accessible={true}
                  accessibilityLabel="Slide 2 image"
                />
                <View style={styles.overlay} />
              </View>
            ),
            title: 'An Toàn & Tin Cậy',
            subtitle: 'Cộng đồng du lịch được xác thực, đánh giá chi tiết từ những chuyến đi trước',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#000',
            image: (
              <View style={styles.imageContainer}>
                <ExpoImage
                  source={require('../assets/slide3.jpg')}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                  accessible={true}
                  accessibilityLabel="Slide 3 image"
                />
                <View style={styles.overlay} />
              </View>
            ),
            title: 'Lên Kế Hoạch Cùng Nhau',
            subtitle: 'Chia sẻ ý tưởng và tạo lịch trình hoàn hảo với người đồng hành',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
          {
            backgroundColor: '#000',
            image: (
              <View style={styles.imageContainer}>
                <ExpoImage
                  source={require('../assets/slide4.jpg')}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                  accessible={true}
                  accessibilityLabel="Slide 4 image"
                />
                <View style={styles.overlay} />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.doneButton}
                    onPress={() => navigation.navigate('DangNhap')}
                  >
                    <Text style={styles.doneButtonText}>Bắt đầu ngay</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ),
            title: 'Hành Trình Không Đơn Độc',
            subtitle: 'Biến mỗi chuyến đi thành kỷ niệm đáng nhớ cùng bạn đồng hành mới',
            titleStyles: styles.title,
            subTitleStyles: styles.subtitle,
          },
        ]}
        DotComponent={DotComponent}
        showSkip={false}
        showNext={false}
        showDone={false}
        bottomBarHighlight={false}
        containerStyles={styles.container}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    width: width,
    height: height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    width: width,
    height: height,
  },
  title: {
    fontSize: Platform.select({ ios: 32, android: 28 }),
    fontWeight: Platform.select({ ios: '800', android: 'bold' }),
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 24,
    position: 'absolute',
    bottom: height * 0.35,
    width: width,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    letterSpacing: 0.5,
    lineHeight: Platform.select({ ios: 38, android: 34 }),
  },
  subtitle: {
    fontSize: Platform.select({ ios: 17, android: 16 }),
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 40,
    position: 'absolute',
    bottom: height * 0.28,
    width: width,
    alignSelf: 'center',
    opacity: 0.9,
    lineHeight: 24,
    letterSpacing: 0.3,
    fontWeight: '400',
  },
  doneButton: {
    backgroundColor: '#FF385C',
    paddingVertical: Platform.select({ ios: 15, android: 12 }),
    paddingHorizontal: 60,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  doneButtonText: {
    color: '#fff',
    fontSize: Platform.select({ ios: 18, android: 16 }),
    fontWeight: Platform.select({ ios: '600', android: 'bold' }),
    letterSpacing: Platform.select({ ios: 0.5, android: 0.25 }),
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center',
      },
    }),
  },
  navigationButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 56, 92, 0.9)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftButton: {
    left: 20,
  },
  rightButton: {
    right: 20,
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    bottom: Platform.select({
      ios: height * 0.08,
      android: height * 0.06,
    }),
  },
  // Style cho dots
  dotStyle: {
    width: Platform.select({ ios: 8, android: 8 }),
    height: Platform.select({ ios: 8, android: 8 }),
    borderRadius: 4,
    marginHorizontal: 3,
    backgroundColor: selected => selected ? '#FF385C' : 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: selected => selected ? 3 : 1,
      },
    }),
  },
});

export default OnboardingScreen;