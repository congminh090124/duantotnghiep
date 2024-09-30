import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window'); // Lấy chiều rộng màn hình

const CreatePostScreen = () => {
    const images = [
        require('../../assets/image.png'),
        require('../../assets/image.png'),
        require('../../assets/delete.png'), // Thêm các ảnh khác vào đây
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="close" size={30} color="black" />
                </TouchableOpacity>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="sync-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="image-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Text style={styles.textButton}>Aa</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Horizontal ScrollView cho phép lướt qua các ảnh */}
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContainer} // Đặt content container
            >
                {images.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image source={image} style={styles.mainImage} />
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.nextButton}>
                <View style={styles.buttonContent}>
                    <Text style={styles.nextButtonText}>Tiếp</Text>
                    <Image source={require('../../assets/delete.png')} style={styles.nextButtonIcon} />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginTop: '10%',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 15,
    },
    textButton: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollViewContainer: {
        // alignItems: 'center', // Căn giữa các phần tử bên trong theo chiều dọc
marginTop:'10%',
justifyContent: 'center', // Căn giữa theo chiều ngang
    },
    imageContainer: {
        width, // Sử dụng toàn bộ chiều rộng màn hình cho mỗi ảnh
        alignItems: 'center', // Căn giữa ảnh
        // backgroundColor:'red'
    },
    mainImage: {
        width: width * 0.8, // Chiều rộng ảnh chiếm 80% màn hình
        height: 300, // Chiều cao ảnh
        borderWidth: 2, // Độ dày của viền
        borderColor: '#000', // Màu của viền
        borderRadius: 10, // Bo tròn góc ảnh
        resizeMode: 'contain', // Đảm bảo ảnh hiển thị đầy đủ mà không bị cắt
    },
    nextButton: {
        backgroundColor: '#000',
        padding: 10,
        borderRadius: 20,
        margin: 10,
        width: 90,
        height: 40,
        left: '70%',
        alignItems: 'center',
        marginBottom: '10%',
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '-2%',
    },
    nextButtonIcon: {
        width: 20, // Kích thước ảnh
        height: 20,
        marginLeft: 5, // Khoảng cách giữa text và ảnh
        tintColor: 'white',
        marginTop: '2%',
    },
});

export default CreatePostScreen;