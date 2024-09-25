import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { ThemedButton } from 'react-native-really-awesome-button';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Fumi } from 'react-native-textinput-effects';

const DangKiTinhNguyenVienScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [reason, setReason] = useState('');

    const navigation = useNavigation();

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSubmit = () => {
        console.log({
            name,
            email,
            phone,
            address,
            reason,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Image
                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.title}> Đăng kí tình nguyện viên </Text>
            </View>

            <KeyboardAvoidingView

                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust this value if needed
            ><ScrollView >
                    <View style={styles.inner}>


                        <View style={styles.formContainer}>
                            <Text style={styles.titlei}>Họ và tên</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Họ và tên"
                                value={name}
                                onChangeText={setName}
                            />
                            <Text style={styles.titlei}>Họ và tên</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                            <Text style={styles.titlei}>Họ và tên</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Số điện thoại"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                            <Text style={styles.titlei}>Họ và tên</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Địa chỉ"
                                value={address}
                                onChangeText={setAddress}
                            />
                            <Text style={styles.titlei}>Họ và tên</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Lý do tham gia"


                                multiline={true} // Cho phép nhập nhiều dòng
                                numberOfLines={1} // Giới hạn số dòng hiển thị
                                blurOnSubmit={true}
                            />

                         

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitText}>Gửi</Text>
                        </TouchableOpacity>

                            {/* <ThemedButton name="bruce" type="twitter" style={styles.submitButton} size='large' onPress={handleSubmit}>
                                <Text style={styles.submitText}>Gửi</Text>
                            </ThemedButton> */}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    inner: {
        padding: 16,
        flex: 1,
        // backgroundColor: 'red',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '10%',
    },
    backButton: {
        marginLeft: '5%',
        // marginRight: 16,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: '10%',
    },
    formContainer: {
        marginBottom: "10%",
        flex: 1,
        justifyContent: 'center',
        marginTop: '10%',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#EBEDED',
        marginBottom: '5%',
        paddingLeft: 8,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',

    },
    submitButton: {
        backgroundColor: '#17C6ED',
        padding: 12,
        borderRadius: 8,
        // width: '80%',
        // alignContent: 'center',
        alignItems: 'center',
        marginTop: '20%',
        // marginLeft: '13%'

    },
    submitText: {
        color: '#fff',
        fontSize: 16,
    },
    titlei: {
        marginBottom: '2%',
        marginLeft: '1%'
    }
});

export default DangKiTinhNguyenVienScreen;
