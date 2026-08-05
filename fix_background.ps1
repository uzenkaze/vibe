$ErrorActionPreference = 'Stop'

# 1. Update BackgroundAudioService.java
$serviceFile = 'livetv-app/android/app/src/main/java/com/example/livetv/BackgroundAudioService.java'
$serviceContent = @"
package com.example.livetv;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;

public class BackgroundAudioService extends Service {

    private static final String CHANNEL_ID = "vibe_music_channel";
    private static final int NOTIFICATION_ID = 1;
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                    "VibeMusic::BackgroundAudio");
            wakeLock.acquire();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Vibe Music")
                .setContentText("앱이 백그라운드에서 재생 중입니다.")
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        stopForeground(true);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Vibe Music Background Service",
                    NotificationManager.IMPORTANCE_LOW
            );
            serviceChannel.setDescription("백그라운드 음악 재생을 유지하기 위한 알림입니다.");
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
"@
Set-Content -Path $serviceFile -Value $serviceContent -Encoding UTF8

# 2. Update MainActivity.java
$mainFile = 'livetv-app/android/app/src/main/java/com/example/livetv/MainActivity.java'
$mainContent = @"
package com.example.livetv;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void onMusicStateChanged(boolean playing) {
                    Intent serviceIntent = new Intent(MainActivity.this, BackgroundAudioService.class);
                    if (playing) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            startForegroundService(serviceIntent);
                        } else {
                            startService(serviceIntent);
                        }
                    } else {
                        stopService(serviceIntent);
                    }
                }
            }, "AndroidNative");
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().onResume();
        }
    }
}
"@
Set-Content -Path $mainFile -Value $mainContent -Encoding UTF8

# 3. Update ytmusic.js
$jsFile = 'livetv-app/src/ytmusic.js'
$jsContent = Get-Content -Path $jsFile -Raw -Encoding UTF8

$oldStateChange = @"
  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      updatePlayPauseIcon();
      startProgressTimer();
      try {
        if (ytPlayer.setPlaybackQuality) ytPlayer.setPlaybackQuality('highres');
      } catch(e) {}
    } else if (event.data === YT.PlayerState.PAUSED) {
      isPlaying = false;
      updatePlayPauseIcon();
      stopProgressTimer();
    } else if (event.data === YT.PlayerState.ENDED) {
      playNext();
    }
  }
"@
$newStateChange = @"
  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      updatePlayPauseIcon();
      startProgressTimer();
      try {
        if (ytPlayer.setPlaybackQuality) ytPlayer.setPlaybackQuality('highres');
      } catch(e) {}
      if (window.AndroidNative) window.AndroidNative.onMusicStateChanged(true);
    } else if (event.data === YT.PlayerState.PAUSED) {
      isPlaying = false;
      updatePlayPauseIcon();
      stopProgressTimer();
      if (window.AndroidNative) window.AndroidNative.onMusicStateChanged(false);
    } else if (event.data === YT.PlayerState.ENDED) {
      if (window.AndroidNative) window.AndroidNative.onMusicStateChanged(false);
      playNext();
    }
  }
"@
$jsContent = $jsContent.Replace($oldStateChange, $newStateChange)
Set-Content -Path $jsFile -Value $jsContent -Encoding UTF8

Write-Host "Patched background audio logic successfully!"
