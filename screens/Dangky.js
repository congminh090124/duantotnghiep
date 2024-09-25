import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, StyleSheet, Dimensions, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
import API_ENDPOINTS from '../apiConfig';
const SignUpScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const navigation = useNavigation();

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (!agreeToTerms) {
            Alert.alert('Error', 'Please agree to the terms');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Registration successful');
                // Navigate to login screen or home screen
                navigation.navigate('TrangChu');
            } else {
                Alert.alert('Error', data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An error occurred. Please try again.');
        }
    };

    return (
        <ScrollView>
            <ImageBackground
                source={require('../assets/ccc.png')} // Add your background image here
                style={styles.background}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Đăng ký</Text>
                    <Image
                        source={require('../assets/vvv.png')}
                        style={styles.headerImage}
                    />
                    <View style={styles.viewinput}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setAgreeToTerms(!agreeToTerms)}
                    >
                        <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]} />
                        <Text style={styles.checkboxLabel}>Đồng ý với điều khoản</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.signupButton, { backgroundColor: agreeToTerms ? '#00c3ff' : '#ccc' }]}
                        disabled={!agreeToTerms}
                        onPress={handleSignUp}
                    >
                        <Text style={styles.signupButtonText}>Đăng ký</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quenmk}>
                        <Text style={{ color: 'blue' }}>Quên mật khẩu</Text>
                    </TouchableOpacity>

                    {/* <Text style={styles.orText}>Hoặc</Text>

                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Image
                                source={require('../assets/logo.png')} // Apple logo
                                style={styles.logo}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton}>
                            <Image
                                source={require('../assets/gg.png')} // Google logo
                                style={styles.logo}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton}>
                            <Image
                                source={require('../assets/fb.png')} // Facebook logo
                                style={styles.logo}
                            />
                        </TouchableOpacity>
                    </View> */}

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
        height: "60%", // Add transparency to make the background visible
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.08,
    },
    headerImage: {
        width: '100%',
        height: height * 0.25,
        resizeMode: 'cover',

        borderRadius: 20,
        marginBottom: height * 0.02,
    },
    title: {
        marginTop: '10%',
        fontSize: width * 0.06,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: height * 0.02,
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
    }
});

export default SignUpScreen;
