import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, StyleSheet, Dimensions, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { register, saveToken } from '../../apiConfig';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
const SignUpScreen = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showTerms, setShowTerms] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const navigation = useNavigation();

    const validateForm = () => {
        const newErrors = {};
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Validate username
        if (!username) {
            newErrors.username = 'Vui lòng nhập tên người dùng';
        } else if (username.length < 3) {
            newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
        }

        // Validate password
        if (!password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else {
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            
            if (password.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            } else if (!hasUpperCase || !hasLowerCase) {
                newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 chữ thường';
            }
        }

        // Validate confirm password
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        // Validate terms agreement
        if (!agreeToTerms) {
            newErrors.terms = 'Vui lòng đồng ý với điều khoản sử dụng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        try {
            const userData = { email, password, username };
            const response = await register(userData);

            if (response.token) {
                await saveToken(response.token);
                await AsyncStorage.setItem('userData', JSON.stringify(response.user));
                Alert.alert('Thành công', 'Đăng ký thành công!');
                navigation.goBack();
            } else {
                Alert.alert('Lỗi', 'Đăng ký không thành công. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    };

    const handleAgreeToTerms = () => {
        setAgreeToTerms(!agreeToTerms);
        if (errors.terms) {
            setErrors(prev => ({...prev, terms: ''}));
        }
    };

    const handleCloseTerms = () => {
        setShowTerms(false);
    };

    const TermsModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showTerms}
            onRequestClose={() => setShowTerms(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Điều khoản sử dụng</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={handleCloseTerms}
                        >
                            <Ionicons name="close" size={24} color="#495057" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.termsContent}>
                        <Text style={styles.termsText}>
                            1. Điều khoản sử dụng{'\n\n'}
                            Bằng cách sử dụng ứng dụng này, bạn đồng ý với các điều khoản sau:{'\n\n'}
                            - Bảo mật thông tin cá nhân{'\n'}
                            - Không chia sẻ tài khoản{'\n'}
                            - Tôn trọng quyền riêng tư của người khác{'\n'}
                            - Không đăng tải nội dung vi phạm pháp luật{'\n\n'}
                            2. Quyền và trách nhiệm{'\n\n'}
                            - Bạn có quyền sử dụng các tính năng của ứng dụng{'\n'}
                            - Bạn có trách nhiệm bảo mật thông tin tài khoản{'\n'}
                            - Chúng tôi có quyền khóa tài khoản vi phạm{'\n\n'}
                            3. Bảo mật thông tin{'\n\n'}
                            - Chúng tôi cam kết bảo vệ thông tin của bạn{'\n'}
                            - Thông tin sẽ không được chia sẻ với bên thứ ba{'\n'}
                        </Text>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={handleAgreeToTerms}
                        >
                            <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]} />
                            <Text style={styles.checkboxLabel}>Tôi đồng ý với điều khoản sử dụng</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, !agreeToTerms && styles.modalButtonDisabled]}
                            onPress={handleCloseTerms}
                            disabled={!agreeToTerms}
                        >
                            <Text style={styles.modalButtonText}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <ScrollView>
            <ImageBackground
                source={require('../../assets/ccc.png')}
                style={styles.background}
            >
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons 
                                name="chevron-back" 
                                size={24} 
                                style={styles.backIcon}
                            />
                        </TouchableOpacity>
                        <Text style={styles.title}>Đăng ký</Text>
                    </View>
                    <Image
                        source={require('../../assets/vvv.png')}
                        style={styles.headerImage}
                    />
                    <View style={styles.viewinput}>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors(prev => ({...prev, email: ''}));
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                        <TextInput
                            style={[styles.input, errors.username && styles.inputError]}
                            placeholder="Tên người dùng"
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text);
                                setErrors(prev => ({...prev, username: ''}));
                            }}
                        />
                        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Mật khẩu"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrors(prev => ({...prev, password: ''}));
                            }}
                            secureTextEntry
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                        <TextInput
                            style={[styles.input, errors.confirmPassword && styles.inputError]}
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrors(prev => ({...prev, confirmPassword: ''}));
                            }}
                            secureTextEntry
                        />
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>

                    <View style={styles.termsContainer}>
                        <ScrollView style={styles.termsContent}>
                            <Text style={styles.termsText}>
                                1. Điều khoản sử dụng{'\n\n'}
                                Bằng cách sử dụng ứng dụng này, bạn đồng ý với các điều khoản sau:{'\n\n'}
                                - Bảo mật thông tin cá nhân{'\n'}
                                - Không chia sẻ tài khoản{'\n'}
                                - Tôn trọng quyền riêng tư của người khác{'\n'}
                                - Không đăng tải nội dung vi phạm pháp luật{'\n\n'}
                                2. Quyền và trách nhiệm{'\n\n'}
                                - Bạn có quyền sử dụng các tính năng của ứng dụng{'\n'}
                                - Bạn có trách nhiệm bảo mật thông tin tài khoản{'\n'}
                                - Chúng tôi có quyền khóa tài khoản vi phạm{'\n\n'}
                                3. Bảo mật thông tin{'\n\n'}
                                - Chúng tôi cam kết bảo vệ thông tin của bạn{'\n'}
                                - Thông tin sẽ không được chia sẻ với bên thứ ba{'\n'}
                            </Text>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={handleAgreeToTerms}
                        >
                            <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]} />
                            <Text style={styles.checkboxLabel}>Tôi đồng ý với điều khoản sử dụng</Text>
                        </TouchableOpacity>
                        {errors.terms && <Text style={[styles.errorText, {textAlign: 'center'}]}>{errors.terms}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[styles.signupButton, !agreeToTerms && styles.disabledButton]}
                        disabled={!agreeToTerms}
                        onPress={handleSignUp}
                    >
                        <Text style={styles.signupButtonText}>Đăng ký</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        flex: 1,
        width: '100%',
        height: '150%',
    },
    container: {
        flex: 1,
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.05,
    },
    headerImage: {
        width: '100%',
        height: height * 0.25,
        resizeMode: 'cover',

        borderRadius: 20,
        marginBottom: height * 0.02,
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: '15%',
    },
    input: {
        backgroundColor: '#f2f2f2',
        padding: width * 0.04,
        borderRadius: 10,
        marginBottom: height * 0.02,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: "5%"
    },
    signupButton: {
        paddingVertical: height * 0.02,
        borderRadius: 10,
        width: "60%",
        marginLeft: "20%",
        marginBottom: height * 0.02,
    },
    signupButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: width * 0.03,
    },
    orText: {
        textAlign: 'center',
        marginBottom: height * 0.02,
        fontSize: width * 0.04,
    },


    socialButtonsContainer: {
        flexDirection: 'row',       // Aligns buttons in a row
        justifyContent: 'center',   // Centers the buttons
        alignItems: 'center',       // Vertically centers the buttons
        marginBottom: height * 0.02,
    },
    socialButton: {
        backgroundColor: '#f2f2f2',
        padding: width * 0.02,      // Reduces the padding for less space around logos
        borderRadius: 10,
        marginHorizontal: width * 0.05,  // Small horizontal margin to keep buttons close
    },
    logo: {
        width: width * 0.07,        // Size of the logos (adjust as needed)
        height: width * 0.07,
    },


    viewButtonLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.02,
    },
    checkbox: {
        width: width * 0.06,
        height: width * 0.06,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#00c3ff',
    },
    checkboxLabel: {
        fontSize: width * 0.04,
    },
    viewinput: {
        marginBottom: "5%",
        marginTop: "-9%"
    },
    inputError: {
        borderColor: '#FA5252',
    },
    errorText: {
        color: '#FA5252',
        fontSize: 14,
        marginTop: -8,
        marginBottom: 8,
        marginLeft: 4,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 10,
    },
    backButton: {
        width: '15%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        color: '#495057',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '90%',
        maxHeight: '80%',
        borderRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
    },
    closeButton: {
        padding: 5,
    },
    termsContent: {
        maxHeight: '60%',
    },
    termsText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#495057',
    },
    modalFooter: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#DEE2E6',
        paddingTop: 20,
    },
    modalButton: {
        backgroundColor: '#228BE6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    modalButtonDisabled: {
        backgroundColor: '#ADB5BD',
        opacity: 0.8,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    termsButton: {
        padding: 12,
        alignItems: 'center',
    },
    termsButtonText: {
        color: '#228BE6',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    termsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        marginHorizontal: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    termsContent: {
        maxHeight: 150,
        marginBottom: 12,
    },
    termsText: {
        fontSize: 13,
        lineHeight: 18,
        color: '#495057',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: '#DEE2E6',
        borderRadius: 4,
        marginRight: 8,
    },
    checkboxChecked: {
        backgroundColor: '#228BE6',
        borderColor: '#228BE6',
    },
    checkboxLabel: {
        fontSize: 13,
        color: '#495057',
    },
    signupButton: {
        backgroundColor: '#228BE6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    disabledButton: {
        backgroundColor: '#ADB5BD',
        opacity: 0.8,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SignUpScreen;
