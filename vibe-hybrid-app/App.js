import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { useKeepAwake } from 'expo-keep-awake';

export default function App() {
  useKeepAwake(); // prevent screen parsing if user wants

  // Automatically find the local IP address from the Expo manifest
  // Fallback to localhost if not found (e.g. running on local emulator instead of phone)
  const hostUri = Constants.experienceUrl || Constants.expoConfig?.hostUri;
  let localIp = 'localhost';
  
  if (hostUri) {
    try {
      // expo://192.168.0.x:8081 -> 192.168.0.x
      const matches = hostUri.match(/:\/\/(.*?):/);
      if (matches && matches[1]) {
        localIp = matches[1];
      }
    } catch (e) {
      console.log('Error parsing hostUri', e);
    }
  }

  // URL of the live server running the existing Vibe Music Box HTML version
  const appUrl = `http://${localIp}:5500/hobby/index.html`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <View style={styles.webviewContainer}>
        <WebView 
          source={{ uri: appUrl }} 
          style={styles.webview}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark background matching the web app
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  webviewContainer: {
    flex: 1,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#0f172a'
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent'
  }
});
