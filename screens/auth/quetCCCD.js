import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { scanCCCD } from '../service/api';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const VerifyIDScreen = () => {
    const navigation = useNavigation();
    const [image, setImage] = useState(null);
    const [isFront, setIsFront] = useState(true);
    const [cameraReady, setCameraReady] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [frontData, setFrontData] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status === 'granted');
        })();
    }, []);

    useEffect(() => {
        setCameraReady(false);
    }, [isFront]);

    const takePicture = async () => {
        if (image) {
            setImage(null);
            return;
        }

        if (cameraRef.current && cameraReady) {
            try {
                const picture = await cameraRef.current.takePictureAsync();
                setImage(picture.uri);
            } catch (err) {
                console.log('Error while taking the picture: ', err);
                Alert.alert('Error', 'Failed to take picture. Please try again.');
            }
        } else {
            Alert.alert('Camera Not Ready', 'Please wait for the camera to initialize fully.');
        }
    };

    const handleSubmit = async () => {
        if (image) {
            try {
                const result = await scanCCCD(image);
                console.log('Kết quả quét CCCD:', result);
                
                if (isFront) {
                    setFrontData(result);
                    setIsFront(false);
                    setImage(null);
                    Alert.alert('Thành công', 'Đã quét xong mặt trước. Vui lòng quét mặt sau.');
                } else {
                    if (frontData) {
                        console.log('Dữ liệu mặt trước trước khi chuyển màn hình:', frontData);
                        const cccdDataToSend = {
                            cccd: frontData.cccd || '',
                            name: frontData.name || '',
                            dob: frontData.dob || '',
                            sex: frontData.sex || '',
                            nationality: frontData.nationality || '',
                            home: frontData.home || '',
                            address: frontData.address || ''
                        };
                        navigation.navigate('ConfirmCCCDScreen', {
                            cccdData: cccdDataToSend
                        });
                    } else {
                        Alert.alert('Lỗi', 'Không tìm thấy dữ liệu mặt trước. Vui lòng thử lại.');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi quét CCCD:', error);
                Alert.alert('Lỗi', 'Không thể quét CCCD. Vui lòng thử lại.');
                setImage(null);
            }
        }
    };

    if (hasCameraPermission === null) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" /></SafeAreaView>;
    }
    if (hasCameraPermission === false) {
        return <SafeAreaView style={styles.container}><Text>No access to camera</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Xác minh ID</Text>
            <Text style={styles.subHeader}>
                Vui lòng chụp một bức ảnh rõ ràng của {isFront ? 'mặt trước' : 'mặt sau'} của thẻ ID của bạn.
            </Text>

            <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                    {image ? (
                        <Image
                            source={{ uri: image }}
                            style={styles.image}
                        />
                    ) : (
                        <>
                            <CameraView
                                style={styles.CameraView}
                                ref={cameraRef}
                                onCameraReady={() => setCameraReady(true)}
                            />
                            {!cameraReady && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#0000ff" />
                                    <Text style={styles.loadingText}>Initializing camera...</Text>
                                </View>
                            )}
                        </>
                    )}
                    <Text style={styles.imageLabel}>{isFront ? 'Mặt trước' : 'Mặt sau'}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.button, !cameraReady && !image && styles.disabledButton]} 
                onPress={takePicture}
                disabled={!cameraReady && !image}
            >
                <Text style={styles.buttonText}>{image ? 'Chụp lại' : 'Chụp ảnh'}</Text>
            </TouchableOpacity>

            {image && (
                <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Gửi ảnh {isFront ? 'mặt trước' : 'mặt sau'}</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 20,
        color: '#555',
    },
    imageContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    imageWrapper: {
        alignItems: 'center',
        width: '100%',
    },
    CameraView: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    imageLabel: {
        marginTop: 5,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    nextButton: {
        backgroundColor: '#28A745',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
});

export default VerifyIDScreen;