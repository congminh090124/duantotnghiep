import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

const SignUpScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    return (
        <ScrollView>
        <View style={styles.container}>
            <Text style={styles.title}>Đăng ký</Text>
            <Image
                source={require('../assets/traveler.png')}
                style={styles.headerImage}
            />
            
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

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
            >
                <Text style={styles.signupButtonText}>Đăng ký</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Hoặc</Text>

            <TouchableOpacity style={styles.socialButton}>
                <View style={styles.viewButtonLogo}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.socialButtonText}>Đăng ký với Apple ID</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
                <View style={styles.viewButtonLogo}>
                    <Image
                        source={require('../assets/gg.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.socialButtonText}>  Đăng ký với Google</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
                <View style={styles.viewButtonLogo}>
                    <Image
                        source={require('../assets/fb.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.socialButtonText}>Đăng ký với Facebook</Text>
                </View>
            </TouchableOpacity>
        </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.03,
    },
    headerImage: {
        width: '100%',
        height: height * 0.25,
        resizeMode: 'cover',
        borderRadius: 20,
        marginBottom: height * 0.02,
    },
    title: {
        marginTop:'10%',
        fontSize: width * 0.06,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: height * 0.02,
    },
    label: {
        fontSize: width * 0.04,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#f2f2f2',
        padding: width * 0.04,
        borderRadius: 10,
        marginBottom: height * 0.02,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    signupButton: {
        paddingVertical: height * 0.02,
        borderRadius: 10,
        marginBottom: height * 0.02,
    },
    signupButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: width * 0.04,
    },
    orText: {
        textAlign: 'center',
        marginBottom: height * 0.02,
        fontSize: width * 0.04,
    },
    socialButton: {
        backgroundColor: '#f2f2f2',
        paddingVertical: height * 0.02,
        borderRadius: 10,
        marginBottom: height * 0.01,
    },
    socialButtonText: {
        textAlign: 'center',
        fontSize: width * 0.04,
    },
    logo: {
        width: width * 0.07,
        height: width * 0.07,
        marginRight: 10,
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
    }
});

export default SignUpScreen;
