import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSocket } from '../../context/SocketContext';
import { API_ENDPOINTS } from '../../apiConfig';

const VideoCallScreen = ({ route, navigation }) => {
    const { socket } = useSocket();
    const webViewRef = useRef(null);
    const {
        channelName,
        userId,
        receiverId,
    } = route.params;

    // Xử lý tin nhắn từ WebView
    const handleWebViewMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            
            switch (data.type) {
                case 'callEnded':
                    navigation.goBack();
                    break;
            }
        } catch (error) {
            console.error('Error handling WebView message:', error);
        }
    };

    // Xử lý back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (webViewRef.current) {
                    webViewRef.current.injectJavaScript('leaveCall();');
                }
                return true;
            }
        );

        return () => backHandler.remove();
    }, []);

    // Xử lý socket events
    useEffect(() => {
        if (!socket) return;

        const handleCallEnded = () => {
            navigation.goBack();
        };

        socket.on('call_ended', handleCallEnded);
        socket.on('call_rejected', handleCallEnded);

        return () => {
            socket.off('call_ended', handleCallEnded);
            socket.off('call_rejected', handleCallEnded);
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