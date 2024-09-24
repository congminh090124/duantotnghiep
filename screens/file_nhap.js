import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Swiper from 'react-native-swiper';

const DangKiDulichScreen = () => {
    const [find, setFind] = useState('');
    const handleBack = () => {
        // Navigation back logic (you need to add the navigation context if necessary)
    };

    return (
        // Sử dụng KeyboardAvoidingView bao quanh toàn bộ giao diện
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // Điều chỉnh hành vi cho iOS và Android
            keyboardVerticalOffset={80}  // Điều chỉnh khoảng cách cho Android
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.inner}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Image
                                source={require('../assets/buttonback.png')} // Đường dẫn tới hình ảnh trong assets
                                style={styles.backIcon}
                            />
                        </TouchableOpacity>

                        <Image
                            source={{ uri: "https://cdn-icons-png.flaticon.com/128/622/622669.png" }}  // icon kính lúp
                            style={styles.image}
                        />
                        <TextInput
                            style={styles.inputSearch}
                            placeholder="Tìm kiếm"
                            keyboardType="email-address"
                            value={find}
                            onChangeText={(text) => setFind(text)}
                        />
                    </View>

                    <Swiper
                        style={styles.wrapper}
                        loop={true}
                        autoplay={true}
                        autoplayTimeout={3}
                        showsPagination={true}
                        paginationStyle={{ top: 90 }}  // Di chuyển pagination lên trên
                    >
                        <View style={styles.slide}>
                            <Image source={require('../assets/coupleTravel.jpg')} style={styles.image3} />
                        </View>
                        <View style={styles.slide}>
                            <Image source={require('../assets/couple2.jpg')} style={styles.image3} />
                        </View>
                        <View style={styles.slide}>
                            <Image source={require('../assets/couple3.jpg')} style={styles.image3} />
                        </View>
                    </Swiper>

                    <View style={{ alignItems: 'flex-start' }}>
                        <Text style={styles.ttal}>
                            Du lịch cùng bạn bè.
                        </Text>
                        <Text style={styles.ttal2}>
                            khám phá thế giới
                        </Text>
                    </View>

                    <Text style={styles.td}>
                        Du lịch cùng bạn bè không chỉ giúp bạn khám phá những địa điểm mới
                        mà còn tạo ra những kỷ niệm đáng nhớ. Hãy cùng nhau lên kế hoạch cho chuyến đi tiếp theo.
                    </Text>

                    <TouchableOpacity style={styles.dkn} onPress={handleBack}>
                        <Text style={{ color: "#fff" }}>Đăng kí ngay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tht} onPress={handleBack}>
                        <Text style={{ color: "#000" }}>Tìm hiểu thêm</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    inner: {
        padding: 16,
        flex: 1,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: '1%',
        marginRight: '50%',
        width: '50%',
        marginLeft: '10%',
        left: 20
    },
    backButton: {
        height: '40%',
        paddingTop: '10%',
        marginTop: '8%',
        left: '-40%',
    },
    backIcon: {
        marginLeft: '1%',
        marginTop: '-70%',
    },
    inputSearch: {
        height: 40,
        width: '170%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 19,
        marginBottom: '20%',
        paddingHorizontal: '50%',
        marginTop: '5%',
        paddingLeft: '20%',
    },
    image: {
        width: 18,
        height: 18,
        marginRight: '6%',
        marginTop: '12%',
        marginLeft: '14%',
        position: 'absolute',
    },
    image3: {
        width: '100%',  // Chiều rộng ảnh
        height: 200,    // Chiều cao cố định
        borderRadius: 10,
    },
    ttal: {
        top: -240,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
        marginLeft: '-30%',
    },
    ttal2: {
        top: -240,
        color: '#fff',
        fontWeight: 'normal',
        fontSize: 15,
        marginLeft: '-30%',
    },
    td: {
        top: -190,
        fontStyle: 'italic',
    },
    dkn: {
        backgroundColor: '#17C6ED',
        marginTop: '5%',
        width: '100%',
        borderRadius: 10,
        alignItems: 'center',
        paddingTop: '3%',
        paddingBottom: '3%',
    },
    tht: {
        marginTop: '5%',
        width: '100%',
        height: '4%',
        alignItems: 'center',
    },
    wrapper: {
        height: '60%',
        borderRadius: 40,
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default DangKiDulichScreen;
