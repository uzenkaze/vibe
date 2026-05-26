package com.example.livetv;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 하드웨어 가속 활성화 (TV/빔프로젝터 렌더링 성능 향상)
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        // TV/빔프로젝터 전체화면 모드 적용
        applyFullscreenMode();

        // WebView 성능 최적화
        optimizeWebView();

        // 안드로이드 13 이상이면 알림 권한 요청
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 1);
        }

        // 포그라운드 서비스 시작
        Intent serviceIntent = new Intent(this, BackgroundAudioService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyFullscreenMode();
        }
    }

    private void applyFullscreenMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ 방식
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
        } else {
            // Android 10 이하 방식 (ZEUS 빔프로젝터 등 구형 TV OS 호환)
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }

        // 화면 켜진 상태 유지 (TV 절전모드 방지)
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    private void optimizeWebView() {
        // Capacitor의 WebView를 찾아 최적화 설정 적용
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        WebSettings settings = webView.getSettings();

        // 하드웨어 가속 렌더링
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // 미디어 자동재생 허용 (TV에서 채널 선택 시 자동재생)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            settings.setMediaPlaybackRequiresUserGesture(false);
        }

        // JavaScript 활성화
        settings.setJavaScriptEnabled(true);

        // 혼합 콘텐츠 허용 (HTTP HLS 스트림 재생)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // 캐시 활성화
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // 뷰포트 메타태그 활성화
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        // DOM Storage 활성화 (즐겨찾기 localStorage 사용)
        settings.setDomStorageEnabled(true);
    }

    @Override
    public void onPause() {
        super.onPause();
        // 백그라운드에서 WebView가 멈추지 않게 하여 오디오 재생 유지
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().onResume();
        }
    }
}
