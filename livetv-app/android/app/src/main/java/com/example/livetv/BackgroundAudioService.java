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

    private android.media.AudioTrack silentAudioTrack;
    private boolean isPlayingSilent = false;
    private Thread silentPlayThread;

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

    private void startSilentPlayback() {
        if (isPlayingSilent) return;
        isPlayingSilent = true;
        
        int sampleRate = 44100;
        int bufferSize = android.media.AudioTrack.getMinBufferSize(
                sampleRate,
                android.media.AudioFormat.CHANNEL_OUT_MONO,
                android.media.AudioFormat.ENCODING_PCM_16BIT
        );
        
        try {
            silentAudioTrack = new android.media.AudioTrack(
                    android.media.AudioManager.STREAM_MUSIC,
                    sampleRate,
                    android.media.AudioFormat.CHANNEL_OUT_MONO,
                    android.media.AudioFormat.ENCODING_PCM_16BIT,
                    bufferSize,
                    android.media.AudioTrack.MODE_STREAM
            );
            
            silentAudioTrack.play();
            
            silentPlayThread = new Thread(() -> {
                byte[] silentBuffer = new byte[bufferSize];
                while (isPlayingSilent) {
                    if (silentAudioTrack != null && silentAudioTrack.getPlayState() == android.media.AudioTrack.PLAYSTATE_PLAYING) {
                        silentAudioTrack.write(silentBuffer, 0, silentBuffer.length);
                    }
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        break;
                    }
                }
            });
            silentPlayThread.start();
            System.out.println("[BackgroundAudio] Silent AudioTrack playback started.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void stopSilentPlayback() {
        isPlayingSilent = false;
        if (silentPlayThread != null) {
            silentPlayThread.interrupt();
            silentPlayThread = null;
        }
        if (silentAudioTrack != null) {
            try {
                silentAudioTrack.stop();
                silentAudioTrack.release();
            } catch (Exception e) {
                e.printStackTrace();
            }
            silentAudioTrack = null;
        }
        System.out.println("[BackgroundAudio] Silent AudioTrack playback stopped.");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        // 노티피케이션 메타데이터 업데이트
        String title = "Vibe Music Player";
        String artist = "음악이 백그라운드에서 재생 중입니다.";
        
        if (intent != null) {
            String t = intent.getStringExtra("title");
            String a = intent.getStringExtra("artist");
            if (t != null) title = t;
            if (a != null) artist = a;
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(artist)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        // 재생 중일 때 무음 오디오 구동하여 미디어 오디오 포커스 세션 인위적 보존
        if (intent != null && intent.getBooleanExtra("playing", true)) {
            startSilentPlayback();
        } else {
            stopSilentPlayback();
        }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopSilentPlayback();
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
