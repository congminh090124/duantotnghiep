import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

export default function VideoCallScreen() {
  const WEB_URL = 'https://enhanced-remotely-bobcat.ngrok-free.app';
  const navigation = useNavigation();

  const onMessage = (event) => {
    const data = event.nativeEvent.data;
    if (data === 'leaveCall') {
      navigation.goBack();
    }
  };

  const injectedJavaScript = `
    window.leaveCall = async function() {
      for (let track of Object.values(localTrack)) {
        track.stop();
        track.close();
      }
      await client.leave();
      window.ReactNativeWebView.postMessage('leaveCall');
    }
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: WEB_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        cameraAccessOnPermission={true}
        microPhoneAccessOnPermission={true}
        onMessage={onMessage}
        injectedJavaScript={injectedJavaScript}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});