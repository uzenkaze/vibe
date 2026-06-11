package com.example.livetv;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import com.getcapacitor.BridgeWebViewClient;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private BroadcastReceiver mediaReceiver;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 1);
        }

        // Java HttpsURLConnection의 SSL 유효성 검사 오류를 전역적으로 무시 (CapacitorHttp 네이티브 통신 방어)
        handleSSLHandshake();

        // SSL 인증서 오류 강제 무시 클라이언트 주입 (구형 Android TV/셋톱박스 인증서 만료 방어)
        new android.os.Handler(android.os.Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().setWebViewClient(new BridgeWebViewClient(getBridge()) {
                        @Override
                        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                            handler.proceed(); // SSL 에러 무시하고 계속 연결 진행
                        }
                    });
                }
            }
        });

        // Register broadcast receiver for media control
        mediaReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (action == null) return;

                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView == null) return;

                if ("com.example.livetv.ACTION_PLAY_PAUSE".equals(action)) {
                    webView.post(() -> webView.evaluateJavascript("javascript:window.togglePlay()", null));
                } else if ("com.example.livetv.ACTION_NEXT".equals(action)) {
                    webView.post(() -> webView.evaluateJavascript("javascript:window.playNext()", null));
                } else if ("com.example.livetv.ACTION_PREV".equals(action)) {
                    webView.post(() -> webView.evaluateJavascript("javascript:window.playPrev()", null));
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction("com.example.livetv.ACTION_PLAY_PAUSE");
        filter.addAction("com.example.livetv.ACTION_NEXT");
        filter.addAction("com.example.livetv.ACTION_PREV");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mediaReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(mediaReceiver, filter);
        }
    }

    private void handleSSLHandshake() {
        try {
            javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[]{
                new javax.net.ssl.X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return new java.security.cert.X509Certificate[0];
                    }
                    public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                }
            };

            javax.net.ssl.SSLContext sc = javax.net.ssl.SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            javax.net.ssl.HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            javax.net.ssl.HttpsURLConnection.setDefaultHostnameVerifier(new javax.net.ssl.HostnameVerifier() {
                public boolean verify(String hostname, javax.net.ssl.SSLSession session) {
                    return true;
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            // 전역 User-Agent를 데스크톱 크롬으로 설정하여 방송사 CDN의 모바일 웹뷰 접속 제한 차단 해제
            webView.getSettings().setUserAgentString("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
            
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void onMusicStateChanged(boolean playing) {
                    Intent serviceIntent = new Intent(MainActivity.this, BackgroundAudioService.class);
                    serviceIntent.putExtra("playing", playing);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        startForegroundService(serviceIntent);
                    } else {
                        startService(serviceIntent);
                    }
                }

                @JavascriptInterface
                public void updateMetadata(String title, String artist, String thumb, boolean playing) {
                    Intent serviceIntent = new Intent(MainActivity.this, BackgroundAudioService.class);
                    serviceIntent.putExtra("title", title);
                    serviceIntent.putExtra("artist", artist);
                    serviceIntent.putExtra("thumb", thumb);
                    serviceIntent.putExtra("playing", playing);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        startForegroundService(serviceIntent);
                    } else {
                        startService(serviceIntent);
                    }
                }

                @JavascriptInterface
                public String fetchKbsApi(String channelCode) {
                    try {
                        java.net.URL url = new java.net.URL("https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/" + channelCode + "?_=" + System.currentTimeMillis());
                        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                        conn.setRequestMethod("GET");
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
                        conn.setRequestProperty("Referer", "https://onair.kbs.co.kr/");
                        conn.setConnectTimeout(5000);
                        conn.setReadTimeout(5000);
                        
                        int responseCode = conn.getResponseCode();
                        if (responseCode == 200) {
                            java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), "UTF-8"));
                            String inputLine;
                            StringBuilder response = new StringBuilder();
                            while ((inputLine = in.readLine()) != null) {
                                response.append(inputLine);
                            }
                            in.close();
                            return response.toString();
                        } else {
                            return "{\"error\": \"HTTP error code: " + responseCode + "\"}";
                        }
                    } catch (Exception e) {
                        return "{\"error\": \"" + e.getMessage() + "\"}";
                    }
                }
            }, "AndroidNative");
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.onResume();
            webView.resumeTimers();
            webView.dispatchWindowVisibilityChanged(View.VISIBLE);
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.onResume();
            webView.dispatchWindowVisibilityChanged(View.VISIBLE);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().dispatchWindowFocusChanged(true);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mediaReceiver != null) {
            try {
                unregisterReceiver(mediaReceiver);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        // App is being closed: stop the background audio service completely
        Intent serviceIntent = new Intent(this, BackgroundAudioService.class);
        stopService(serviceIntent);
    }
}
