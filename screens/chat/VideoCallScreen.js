import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
  ChannelProfile,
  ClientRole,
} from 'react-native-agora';

const VideoCallScreen = ({ navigation }) => {
  const [engine, setEngine] = useState(null);
  const [joinSucceed, setJoinSucceed] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Thay thế bằng Agora App ID của bạn
  const appId = 'YOUR_AGORA_APP_ID';
  const channelName = 'test-channel';

  useEffect(() => {
    initAgora();
    return () => {
      engine?.destroy();
    };
  }, []);

  const requestCameraAndAudioPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Permissions granted');
      } else {
        console.log('Permissions denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const initAgora = async () => {
    if (Platform.OS === 'android') {
      await requestCameraAndAudioPermission();
    }

    try {
      const agoraEngine = await RtcEngine.create(appId);
      await agoraEngine.enableVideo();
      await agoraEngine.enableAudio();

      agoraEngine.addListener('Warning', (warn) => {
        console.log('Warning', warn);
      });

      agoraEngine.addListener('Error', (err) => {
        console.log('Error', err);
      });

      agoraEngine.addListener('UserJoined', (uid, elapsed) => {
        console.log('UserJoined', uid, elapsed);
        setRemoteUid(uid);
      });

      agoraEngine.addListener('UserOffline', (uid, reason) => {
        console.log('UserOffline', uid, reason);
        setRemoteUid(null);
      });

      agoraEngine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
        console.log('JoinChannelSuccess', channel, uid, elapsed);
        setJoinSucceed(true);
      });

      setEngine(agoraEngine);
      await agoraEngine.joinChannel(null, channelName, null, 0);
    } catch (e) {
      console.log(e);
    }
  };

  const toggleMute = async () => {
    await engine?.muteLocalAudioStream(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleCamera = async () => {
    await engine?.enableLocalVideo(!isCameraOff);
    setIsCameraOff(!isCameraOff);
  };

  const endCall = async () => {
    await engine?.leaveChannel();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {joinSucceed && (
        <>
          <View style={styles.fullView}>
            {remoteUid ? (
              <RtcRemoteView.SurfaceView
                style={styles.fullView}
                uid={remoteUid}
                channelId={channelName}
                renderMode={VideoRenderMode.Hidden}
              />
            ) : (
              <View style={styles.noUserContainer}>
                <Text style={styles.noUserText}>Waiting for other user to join...</Text>
              </View>
            )}
            <RtcLocalView.SurfaceView
              style={styles.localView}
              channelId={channelName}
              renderMode={VideoRenderMode.Hidden}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={toggleMute}
              style={[styles.button, isMuted && styles.buttonActive]}
            >
              <Text style={styles.buttonText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleCamera}
              style={[styles.button, isCameraOff && styles.buttonActive]}
            >
              <Text style={styles.buttonText}>
                {isCameraOff ? 'Camera On' : 'Camera Off'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={endCall}
              style={[styles.button, styles.endCallButton]}
            >
              <Text style={styles.buttonText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullView: {
    flex: 1,
  },
  localView: {
    position: 'absolute',
    right: 20,
    top: 40,
    width: 120,
    height: 160,
  },
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noUserText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    minWidth: 100,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VideoCallScreen;