package com.example.livetv;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.core.app.NotificationCompat;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class BackgroundAudioService extends Service {

    private static final String CHANNEL_ID = "vibe_music_channel";
    private static final int NOTIFICATION_ID = 1;
    private PowerManager.WakeLock wakeLock;

    private android.media.AudioTrack silentAudioTrack;
    private boolean isPlayingSilent = false;
    private Thread silentPlayThread;

    private MediaSessionCompat mediaSession;
    private Bitmap currentAlbumArt = null;
    private String lastThumbUrl = "";

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

        // Initialize MediaSessionCompat
        mediaSession = new MediaSessionCompat(this, "VibeMusicSession");
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                sendBroadcast(new Intent("com.example.livetv.ACTION_PLAY_PAUSE"));
            }

            @Override
            public void onPause() {
                sendBroadcast(new Intent("com.example.livetv.ACTION_PLAY_PAUSE"));
            }

            @Override
            public void onSkipToNext() {
                sendBroadcast(new Intent("com.example.livetv.ACTION_NEXT"));
            }

            @Override
            public void onSkipToPrevious() {
                sendBroadcast(new Intent("com.example.livetv.ACTION_PREV"));
            }
        });
        mediaSession.setActive(true);
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

    private void updatePlaybackProgress(long position, long duration, boolean playing) {
        if (mediaSession == null) return;

        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
                .setActions(PlaybackStateCompat.ACTION_PLAY | 
                            PlaybackStateCompat.ACTION_PAUSE | 
                            PlaybackStateCompat.ACTION_SKIP_TO_NEXT | 
                            PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS);

        int state = playing ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        // position과 속도(1.0f or 0.0f)를 시스템 타임스탬프와 매핑하면 안드로이드 OS가 자동으로 타임바 보간 애니메이션을 수행합니다.
        stateBuilder.setState(state, position, playing ? 1.0f : 0.0f, System.currentTimeMillis());
        mediaSession.setPlaybackState(stateBuilder.build());

        android.support.v4.media.MediaMetadataCompat currentMetadata = mediaSession.getController().getMetadata();
        MediaMetadataCompat.Builder metadataBuilder;
        if (currentMetadata != null) {
            metadataBuilder = new MediaMetadataCompat.Builder(currentMetadata);
        } else {
            metadataBuilder = new MediaMetadataCompat.Builder();
        }
        metadataBuilder.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration);
        mediaSession.setMetadata(metadataBuilder.build());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            boolean updateProgress = intent.getBooleanExtra("update_progress", false);
            if (updateProgress) {
                long position = intent.getLongExtra("position", 0);
                long duration = intent.getLongExtra("duration", 0);
                boolean playing = intent.getBooleanExtra("playing", true);
                updatePlaybackProgress(position, duration, playing);
                return START_STICKY;
            }
        }

        String title = "Vibe Music Player";
        String artist = "음악이 백그라운드에서 재생 중입니다.";
        String thumb = "";
        boolean playing = true;

        if (intent != null) {
            String t = intent.getStringExtra("title");
            String a = intent.getStringExtra("artist");
            String th = intent.getStringExtra("thumb");
            if (t != null) title = t;
            if (a != null) artist = a;
            if (th != null) thumb = th;
            playing = intent.getBooleanExtra("playing", true);
        }

        final String finalTitle = title;
        final String finalArtist = artist;
        final boolean finalPlaying = playing;

        // 비동기 이미지(앨범 아트) 다운로드 및 알림 빌드 호출
        if (thumb != null && !thumb.isEmpty() && !thumb.equals(lastThumbUrl)) {
            lastThumbUrl = thumb;
            new Thread(() -> {
                Bitmap bmp = downloadBitmap(lastThumbUrl);
                if (bmp != null) {
                    currentAlbumArt = bmp;
                    updateNotificationAndSession(finalTitle, finalArtist, finalPlaying);
                }
            }).start();
        }

        updateNotificationAndSession(title, artist, playing);

        // 재생 상태에 따라 무음 트랙 구동 조율
        if (playing) {
            startSilentPlayback();
        } else {
            stopSilentPlayback();
        }

        return START_STICKY;
    }

    private void updateNotificationAndSession(String title, String artist, boolean playing) {
        // Update MediaSession Status
        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
                .setActions(PlaybackStateCompat.ACTION_PLAY | 
                            PlaybackStateCompat.ACTION_PAUSE | 
                            PlaybackStateCompat.ACTION_SKIP_TO_NEXT | 
                            PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS);

        if (playing) {
            stateBuilder.setState(PlaybackStateCompat.STATE_PLAYING, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1.0f);
        } else {
            stateBuilder.setState(PlaybackStateCompat.STATE_PAUSED, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 0.0f);
        }
        mediaSession.setPlaybackState(stateBuilder.build());

        MediaMetadataCompat.Builder metadataBuilder = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist);

        if (currentAlbumArt != null) {
            metadataBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, currentAlbumArt);
        }
        mediaSession.setMetadata(metadataBuilder.build());

        // 알림 제어용 PendingIntent 준비
        int flag = PendingIntent.FLAG_IMMUTABLE;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flag |= PendingIntent.FLAG_UPDATE_CURRENT;
        }
        
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, flag);

        Intent playPauseIntent = new Intent("com.example.livetv.ACTION_PLAY_PAUSE");
        PendingIntent playPausePI = PendingIntent.getBroadcast(this, 1, playPauseIntent, flag);

        Intent nextIntent = new Intent("com.example.livetv.ACTION_NEXT");
        PendingIntent nextPI = PendingIntent.getBroadcast(this, 2, nextIntent, flag);

        Intent prevIntent = new Intent("com.example.livetv.ACTION_PREV");
        PendingIntent prevPI = PendingIntent.getBroadcast(this, 3, prevIntent, flag);

        int playPauseIcon = playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle(title)
                .setContentText(artist)
                .setLargeIcon(currentAlbumArt)
                .setContentIntent(pendingIntent)
                .setOngoing(playing)
                .addAction(android.R.drawable.ic_media_previous, "Previous", prevPI)
                .addAction(playPauseIcon, playing ? "Pause" : "Play", playPausePI)
                .addAction(android.R.drawable.ic_media_next, "Next", nextPI)
                .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                        .setShowActionsInCompactView(0, 1, 2)
                        .setMediaSession(mediaSession.getSessionToken()))
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private Bitmap downloadBitmap(String urlStr) {
        try {
            URL url = new URL(urlStr);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopSilentPlayback();
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
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
