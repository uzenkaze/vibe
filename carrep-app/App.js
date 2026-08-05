import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  // 배포된 실시간 하이브리드 웹 주소 연결 (캐시 무효화 타임스탬프 적용)
  const [appUrl] = useState(() => `https://uzenkaze.github.io/vibe/carrep/?t=${Date.now()}`);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.webviewContainer}>
        <WebView 
          key={appUrl}
          source={{ uri: appUrl }} 
          style={styles.webview}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          cacheEnabled={false}
          incognito={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent'
  }
});
