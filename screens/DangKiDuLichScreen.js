import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Swiper from 'react-native-swiper';
// import NhanTinScreen from '../screens/NhanTinScreen';
// import DangBaiScreen from '../screens/DangBaiScreen';


const Tab = createBottomTabNavigator(); // tạo tab navigator


const DangKiDulichScreen = () => {
    const [find, setFind] = useState('');
    return (


        <SafeAreaView style={styles.container}>



            <View style={styles.inner}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Image
                            source={require('../assets/buttonback.png')} // Đường dẫn tới hình ảnh trong assets
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>



                </View>


                {/* <Image
                    //ảnh to
                    source={require('../assets/coupleTravel.jpg')}
                    style={styles.image3}
                /> */}


                <Swiper
                    style={styles.wrapper}
                    loop={true}               // Lặp lại khi đến ảnh cuối
                    autoplay={true}           // Tự động lướt
                    autoplayTimeout={3}       // Thời gian giữa các lần lướt (giây)
                    showsPagination={true}    // Hiển thị dấu chấm nhỏ chỉ số ảnh
                    paginationStyle={{ top: 90 }}  // Di chuyển pagination lên phía trên
                >
                    <View style={styles.slide}>
                        <Image
                            source={require('../assets/coupleTravel.jpg')}  // Ảnh 1
                            style={styles.image3}
                        />
                    </View>
                    <View style={styles.slide}>
                        <Image
                            source={require('../assets/couple2.jpg')}           // Ảnh 2
                            style={styles.image3}
                        />
                    </View>
                    <View style={styles.slide}>
                        <Image
                            source={require('../assets/couple3.jpg')} // Ảnh 3 (bạn có thể thêm ảnh khác)
                            style={styles.image3}
                        />
                    </View>
                </Swiper>


                <View style={{ alignItems: 'flex-start' }}>
                    <Text style={styles.ttal}>
                        Du lịch cùng bạn bè.
                    </Text>
                    <Text style={styles.ttal2} >
                        khám phá thế giới
                    </Text>

                </View>


                <Text style={styles.td}>
                    Du lịch cùng bạn bè không chỉ giúp bạn khám phá những địa điểm mới
                    mà còn tạo ra những kỷ niệm đáng nhớ
                    . Hãy cùng nhau lên kế hoạch cho chuyến đi tiếp theo,
                    từ việc chọn địa điểm, đặt vé...
                </Text>

                <TouchableOpacity style={styles.dkn} >
                    <Text style={{ color: "#fff" }}>Đăng kí ngay</Text>
                </TouchableOpacity>

                 


                <TouchableOpacity style={styles.tht}>
                    <Text style={{ color: "#000" }}>Tìm hiểu </Text>
                </TouchableOpacity>



            </View>



        </SafeAreaView>

    );

};





const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 16,
        backgroundColor: '#fff',
    },

    inner: {
        padding: 16,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between', // Thêm dòng này
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: '1%',
        marginRight: '50%',
        width: '50%',
        marginLeft: '10%',
        left: 20
        left: 20
    },
    backButton: {
        height: '40%',
        paddingTop: '10%',
        marginTop: '8%',
        left: '-80%',

    },
    backIcon: {
        marginLeft: '1%',
        marginTop: '-70%',
        paddingLeft: '0%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: '15%',
    },



    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',

    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    xacMinh: {
        fontSize: 20,
        marginBottom: '5%',
        fontWeight: 'bold',

    },
    textValidate: {

        fontSize: 10,
        color: '#5B6D72',
        marginBottom: '5%',


    },
    textNhanOtp: {
        textAlign: 'center',
        fontSize: 12,
        color: '#5B6D72',
        marginTop: '5%',
    },


    image2: {
        width: 25,
        height: 25,
        marginLeft: "77%"
    }, image3: {
        width: '100%',  // Chiều rộng 100% của khung chứa
        height: 200,    // Chiều cao cố định, bạn có thể điều chỉnh cho phù hợp
        borderRadius: 10, // Nếu muốn bo tròn góc
    },

    ttal: {

        // marginTop: '-20%',
        color: '#fff',
        top: -240,
        top: -240,
        fontWeight: 'bold',
        fontSize: 20,
        marginLeft: '-30%',

    },
    ttal2: {

        // marginTop: '-15%',
        color: '#fff',
        fontWeight: 'normal',
        fontSize: 15,
        top: -240,
        marginLeft: '-30%',

    },
    td: {
        // marginTop: '5%'
        top: -40,
        top: -40,
        fontStyle: 'italic',
        // backgroundColor: 'gray',
        borderTopLeftRadius: 10, //
        borderTopRightRadius: 10,
        padding: 10,
        height: 'auto',
        borderTopRightRadius: 10,
        padding: 10,
        height: 'auto',
    },

    dkn: {
        backgroundColor: '#17C6ED',
        marginTop: '5%',
        width: '100%',
        borderRadius: 10,
        alignItems: 'center',
        paddingTop: '3%',
        paddingBottom: '3%',
    }, tht: {
        marginTop: '5%',
        width: '100%',
        height: '4%',
        alignItems: 'center',
    },
    wrapper: {
        height: '60%',  // Đảm bảo chiều cao cho Swiper
        borderRadius: 40
        borderRadius: 40
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    image3: {
        width: '100%',  // Đảm bảo ảnh to chiếm toàn bộ chiều rộng
        height: 200,    // Chiều cao cố định, điều chỉnh nếu cần
        borderRadius: 10,
    },




});


export default DangKiDulichScreen;
