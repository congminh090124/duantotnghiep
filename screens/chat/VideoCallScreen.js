import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VideoCallScreen = ({ route, navigation }) => {
    const { socket } = useSocket();
    const webViewRef = useRef(null);
    const [callDuration, setCallDuration] = useState(0);
    const durationIntervalRef = useRef(null);
    const {
        channelName,
        userId,
        receiverId,
        isInitiator = false
    } = route.params;

    // Xử lý tin nhắn từ WebView
    const handleWebViewMessage = async (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            
            switch (data.type) {
                case 'callConnected':
                    // Bắt đầu đếm thời gian cuộc gọi
                    durationIntervalRef.current = setInterval(() => {
                        setCallDuration(prev => prev + 1);
                    }, 1000);
                    break;

                case 'callEnded':
                    await handleEndCall();
                    break;

                case 'callError':
                    Alert.alert('Lỗi', data.error);
                    navigation.goBack();
                    break;
            }
        } catch (error) {
            console.error('Error handling WebView message:', error);
        }
    };

    // Xử lý kết thúc cuộc gọi
    const handleEndCall = async () => {
        try {
            clearInterval(durationIntervalRef.current);
            
            const token = await AsyncStorage.getItem('userToken');
            await axios.post(
                `${API_ENDPOINTS.socketURL}/api/chat/video-call/end`,
                {
                    channelName,
                    receiverId,
                    duration: callDuration
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            navigation.goBack();
        } catch (error) {
            console.error('Error ending call:', error);
            navigation.goBack();
        }
    };

    // Xử lý back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                Alert.alert(
                    'Kết thúc cuộc gọi',
                    'Bạn có chắc muốn kết thúc cuộc gọi?',
                    [
                        {
                            text: 'Hủy',
                            style: 'cancel'
                        },
                        {
                            text: 'Kết thúc',
                            style: 'destructive',
                            onPress: handleEndCall
                        }
                    ]
                );
                return true;
            }
        );

        return () => {
            backHandler.remove();
            clearInterval(durationIntervalRef.current);
        };
    }, []);

    // Xử lý socket events
    useEffect(() => {
        if (!socket) return;

        const handleCallEnded = () => {
            Alert.alert('Thông báo', 'Cuộc gọi đã kết thúc');
            navigation.goBack();
        };

        socket.on('call_ended', handleCallEnded);

        return () => {
            socket.off('call_ended', handleCallEnded);
        };
    }, [socket]);

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{
                    uri: `${API_ENDPOINTS.socketURL}/video-call.html?channel=${channelName}&userId=${userId}`
                }}
                onMessage={handleWebViewMessage}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                style={styles.webview}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent'
    }
});

export default VideoCallScreen;