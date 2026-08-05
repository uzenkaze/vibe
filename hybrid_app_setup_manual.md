# Vibe Music Box - 하이브리드 앱 구축 매뉴얼

현재 구현된 웹(HTML/JS) 버전의 **Vibe Music Box**를 모바일 기기 네이티브 앱 형태로 변환하여 구동하고, 정식 안드로이드 앱 설치 파일(APK)로 빌드하기 위한 두 가지 방법에 대한 상세 매뉴얼입니다. 다른 PC 환경에서 세팅하실 때 참고하시기 바랍니다.

---

## 옵션 1: Expo (React Native) 방식 🌟 (빠른 테스트 용도)
무거운 Android SDK나 Java 설치 없이도, Node.js만 있으면 바로 내 스마트폰에서 네이티브 앱 형태로 화면 및 기능을 테스트 할 수 있는 가장 빠르고 쉬운 방법입니다. 기존 웹 소스코드에 아무런 데미지를 주지 않습니다.

### 📋 사전 준비 사항
*   **스마트폰**: Google Play Store 혹은 Apple App Store에서 **`Expo Go`** 어플리케이션 설치.
*   **Node.js**: 최신 LTS 버전 설치 완료 상태. (명령 프롬프트에서 `node -v` 쳐서 확인)
*   **중요 요건**: 테스트를 진행할 PC와 테스트 스마트폰 기기가 **반드시 동일한 Wi-Fi 네트워크 망**에 연결되어 있어야 합니다. (회사망-LTE 등 각기 다른 인터넷망 연결 시 접속 불가)

### 🛠️ 프로젝트 설치 및 설정 방법
1. **터미널을 열고 Expo 프로젝트 생성**
   작업 폴더의 최상단에서 아래의 명령어를 순차적으로 실행합니다.
   ```bash
   npx -y create-expo-app@latest vibe-hybrid-app --template blank
   cd vibe-hybrid-app
   ```

2. **React Native WebView 모듈 설치**
   앱 내에 브라우저를 띄워 로컬 HTML 파일을 호출할 모듈을 설치합니다.
   ```bash
   npx expo install react-native-webview expo-keep-awake expo-constants
   ```

3. **Web View 화면 연동 (App.js 수정)**
   방금 설치한 `vibe-hybrid-app` 폴더 내에 생성된 `App.js` 파일을 열고 내용을 다음과 같이 변경해 줍니다.
   ```javascript
   import React from 'react';
   import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
   import { WebView } from 'react-native-webview';
   import Constants from 'expo-constants';
   import { useKeepAwake } from 'expo-keep-awake';

   export default function App() {
     useKeepAwake(); // 화면 꺼짐 방지
     
     // Expo 설정으로부터 PC의 로컬 네트워크 IP를 자동 추출
     const hostUri = Constants.experienceUrl || Constants.expoConfig?.hostUri;
     let localIp = 'localhost';
     if (hostUri) {
       try { localIp = hostUri.match(/:\/\/(.*?):/)[1]; } catch (e) {}
     }

     // 기존 Vibe Music HTML 5500 포트로 포워딩 (PC와 스마트폰이 같은 와이파이 필수)
     const appUrl = `http://${localIp}:5500/hobby/index.html`;

     return (
       <SafeAreaView style={styles.container}>
         <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
         <View style={styles.webviewContainer}>
           <WebView source={{ uri: appUrl }} style={{ flex: 1, backgroundColor: 'transparent' }} />
         </View>
       </SafeAreaView>
     );
   }

   const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#0f172a', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
     webviewContainer: { flex: 1, backgroundColor: '#0f172a' }
   });
   ```

4. **두 개의 로컬 서버 켜기 (웹 + 앱)**
   *   VScode 등에서 기존 `hobby/index.html` 파일을 **Live Server (5500 포트)**로 실행합니다.
   *   터미널에서 설정한 앱 폴더(`d:\VibeCoding\vibe-hybrid-app`)로 오신 후, `npx expo start` 를 실행합니다.
   *   방화벽 허용 창이 뜨면 허용을 눌러줍니다.

5. **폰에서 확인하기 (스캔)**
   *   터미널 화면에 커다란 QR 코드가 뜹니다.
   *   폰의 `Expo Go` 앱을 열고 [Scan QR Code] 버튼을 눌러 스캔하면 폰에서 성공적으로 실행됩니다!


---
---

## 옵션 2: React + Capacitor 방식 (정식 APK/AAB 빌드 배포용)
실제 `.apk` 설치 파일을 만들고 개인 폰에 직접 깔아서 외부 망 환경/이동 중에도 무제한으로 사용하고 싶을 때 사용하는 프로덕션 빌드 방식입니다. 

### 📋 사전 준비 사항
해당 옵션은 PC에 본격적인 안드로이드 네이티브 빌드(Compile) 환경 구축이 필수적입니다.
*   **Java Development Kit (JDK 17)** 다운로드 후 시스템 환경 변수(JAVA_HOME) 설정.
*   **Android Studio** 전체 설치 (https://developer.android.com/studio) 및 SDK 구성 확인.
*   **Node.js**: 최신 LTS 버전 상태.

### 🛠️ 하이브리드 자동 빌드 구축 방법
1. **React 기반 Web 스캐폴딩 프로젝트 생성**
   Capacitor가 기존 코드를 안드로이드 패키징 하려면 정적 파일(`.html, .js` 등이 빌드 폴더 1개에 담긴 구조) 방식이나 React 프로젝트(`dist` 폴더 빌드) 포맷이 필요합니다.
   ```bash
   npm create vite@latest vibe-music-react -- --template react
   cd vibe-music-react
   npm install
   ```
   *(본격적으로 만드실 때는 여기 `vibe-music-react` 프로젝트 안으로 기존 바닐라 HTML 코드를 리액트 컴포넌트로 완전히 쪼개서 옮기는 과정이 선행되는 것이 가장 이상적입니다.)*

2. **Capacitor 코어 설치 및 초기 파일 생성**
   ```bash
   npm install @capacitor/core @capacitor/android
   npm install -D @capacitor/cli

   npx cap init VibeMusicApp com.vibe.music
   ```

3. **안드로이드 기능 및 리소스 폴더 생성**
   ```bash
   npx cap add android
   ```

4. **웹 소스코드 컴파일 및 Capacitor 안드로이드 구조에 플러그인 이관 통합**
   React로 작성하거나 옮긴 소스코드를 1차로 정적 파일 보관 형태(`dist` 폴더)로 빌드합니다. (이때 `vite.config.js` 또는 `capacitor.config.json` 에서 webDir 경로가 제대로 매핑 여부를 항상 검증합니다)
   ```bash
   npm run build
   npx cap copy
   ```

5. **[핵심] Android Studio로 빌드(Build) 후 APK 추출하기!**
   모든 HTML과 코드 파일을 Android 기기가 알아들을 수 있게 컴파일하는 과정입니다.
   ```bash
   npx cap open android
   ```
   *   위 명령어를 치면 자동으로 PC에 설치된 Android Studio가 열리면서 이관된 프로젝트 파일을 불러옵니다.
   *   오른쪽 하단 로딩 바가 완전히 멈추고 **초기 동기화(Gradle Sync)가 끝날 때까지 5분 가량** 대기합니다.
   *   안드로이드 스튜디오 상단 메뉴바에서 **[Build] > [Build Bundle(s) / APK(s)] > [Build APK(s)]** 항목을 클릭합니다.
   *   수십 초~1분의 빌드 과정이 끝나면, 우측 하단 팝업에 `locate` 파란색 링크가 뜨게 됩니다. 뜨지 않으면 좌측 `android/app/build/outputs/apk/debug/` 폴더를 직접 찾아서 들어가시면 최상단에 `app-debug.apk` 설치 파일이 최종 완성되어 있습니다!

### 🎉 완성 후 설치
해당 `app-debug.apk` 파일을 카카오톡 '나에게 보내기', 구글 드라이브, 스마트폰과 USB 연결 등으로 폰에 복사한 후, 스마트폰 탐색기(내 파일)에서 열어 설치하시면 완료됩니다. 이제부터 어떤 네트워크 제약도 받지 않는 나만의 독립된 모바일 앱으로 재탄생하게 됩니다.
