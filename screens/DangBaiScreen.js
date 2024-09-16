import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DangBaiScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Điều chỉnh offset phù hợp
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: '#fff' }}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Image
                            source={require('../assets/buttonback.png')}
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Tạo bài đăng tìm bạn đồng hành</Text>
                    </View>

                    <View style={styles.rowAnh}>
                        <Image
                            source={{ uri: "https://cdn-icons-png.flaticon.com/128/2951/2951086.png" }}
                            style={styles.image}
                        />
                        <Text style={styles.cab}>Chọn ảnh bìa</Text>

                        <TouchableOpacity style={styles.btnThem}>
                            <Text style={styles.btnThemText}>Thêm</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.titleLabel}>Tiêu đề chuyến đi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                              onChangeText={setBudget}
                            multiline={true} // Cho phép nhập nhiều dòng
                            numberOfLines={1} // Giới hạn số dòng hiển thị
                            blurOnSubmit={true}
                             // Chỉ cho phép nhập số
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Chi tiết chuyến đi</Text>
                        <TouchableOpacity style={styles.button}>
                            <Image
                                source={{ uri: "https://cdn-icons-png.flaticon.com/128/2838/2838779.png" }}
                                style={styles.image2}
                            />
                            <Text style={styles.buttonText}>Ngày bắt đầu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}>
                            <Image
                                source={{ uri: "https://cdn-icons-png.flaticon.com/128/2838/2838779.png" }}
                                style={styles.image2}
                            />
                            <Text style={styles.buttonText}>Ngày kết thúc</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}>
                            <Image
                                source={{ uri: "https://cdn-icons-png.flaticon.com/128/819/819865.png" }}
                                style={styles.image2}
                            />
                            <Text style={styles.buttonText}>Điểm đến</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.textAreaContainer}>
                        <Text style={styles.label}>Mô tả chuyến đi</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Mô tả kế hoạch du lịch của bạn"
                            multiline={true} // Cho phép nhập nhiều dòng
                            numberOfLines={1} // Giới hạn số dòng hiển thị
                            blurOnSubmit={true}
                        />
                    </View>

                    <View style={styles.budgetContainer}>
                        <Text style={styles.budgetLabel}>Ngân sách</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="$1000 - $2000"
                            value={budget}
                            onChangeText={setBudget}
                            keyboardType="numeric" // Chỉ cho phép nhập số
                        />
                        <TouchableOpacity style={styles.submitButton}>
                            <Text style={styles.submitButtonText}>Tạo bài đăng</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F6F8F9',
    },
    header: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    titleLabel: {
        marginBottom:"5%",
        fontSize: 17,
        fontWeight: 'bold',
    },
    subText: {
        fontSize: 15,
        marginBottom: 5,
        marginTop: 5,
    },
    input: {
        height: 66,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    textArea: {
        height: 120,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: 'blue',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
    },
    backButton: {
        marginBottom: 20,
        width: 30,
    },
    rowAnh: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cab: {
        marginLeft: 15,
        flex: 1,
    },
    image: {
        width: 25,
        height: 25,
        marginLeft: 10,
    },
    btnThem: {
        backgroundColor: '#EBEDED',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    btnThemText: {
        textAlign: 'center',
        color: '#000',
    },
    image2: {
        width: 22,
        height: 22,
    },
    textAreaContainer: {
        marginBottom: 20,
    },
    budgetContainer: {
        marginBottom: 40,
    },
    budgetLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default DangBaiScreen;
