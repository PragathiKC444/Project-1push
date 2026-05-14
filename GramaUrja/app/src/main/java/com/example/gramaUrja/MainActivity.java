package com.example.gramaUrja;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Timer;
import java.util.TimerTask;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";
    private static final String PREFS_NAME = "GramaUrjaPrefs";
    private static final String SELECTED_ZONE = "selected_zone";

    private TextView zoneName, statusValue, freshness;
    private Button btnPowerOn, btnPowerOff, btnChangeZone, btnPumpTimer;
    private FrameLayout statusContainer;
    private ProgressBar syncProgress;
    private View liveIndicator;

    private DatabaseReference zoneRef;
    private String currentZone = "Village Main";
    private boolean powerStatus = false;
    private long lastUpdateTime = 0;

    private Timer freshnessTimer;
    private Handler mainHandler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initializeViews();
        loadSavedZone();
        setupFirebaseListener();
        startFreshnessUpdater();
    }

    private void initializeViews() {
        zoneName = findViewById(R.id.zone_name);
        statusValue = findViewById(R.id.status_value);
        freshness = findViewById(R.id.freshness);
        btnPowerOn = findViewById(R.id.btn_power_on);
        btnPowerOff = findViewById(R.id.btn_power_off);
        btnChangeZone = findViewById(R.id.btn_change_zone);
        btnPumpTimer = findViewById(R.id.btn_pump_timer);
        statusContainer = findViewById(R.id.status_container);
        syncProgress = findViewById(R.id.sync_progress);
        liveIndicator = findViewById(R.id.live_indicator);

        mainHandler = new Handler(Looper.getMainLooper());

        btnPowerOn.setOnClickListener(v -> updatePowerStatus(true));
        btnPowerOff.setOnClickListener(v -> updatePowerStatus(false));
        btnChangeZone.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, ZoneSelectionActivity.class)));
        btnPumpTimer.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, PumpTimerActivity.class)));
    }

    private void loadSavedZone() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        currentZone = prefs.getString(SELECTED_ZONE, "Village Main");
        zoneName.setText("Zone: " + currentZone);
    }

    private void setupFirebaseListener() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        zoneRef = database.getReference("zones/" + sanitizeZoneName(currentZone));

        zoneRef.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    powerStatus = snapshot.child("status").getValue(Boolean.class) != null
                            && snapshot.child("status").getValue(Boolean.class);
                    lastUpdateTime = snapshot.child("timestamp").getValue(Long.class) != null
                            ? snapshot.child("timestamp").getValue(Long.class)
                            : System.currentTimeMillis();

                    updateUI();
                    Log.d(TAG, "Status updated: " + powerStatus);
                } else {
                    // Initialize zone if doesn't exist
                    initializeZone();
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                Log.e(TAG, "Firebase error: " + error.getMessage());
                Toast.makeText(MainActivity.this, "Error syncing status", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void initializeZone() {
        PowerStatusData data = new PowerStatusData(false, System.currentTimeMillis(), "System");
        zoneRef.setValue(data);
    }

    private void updatePowerStatus(boolean isOn) {
        syncProgress.setVisibility(View.VISIBLE);

        powerStatus = isOn;
        lastUpdateTime = System.currentTimeMillis();

        PowerStatusData data = new PowerStatusData(isOn, lastUpdateTime, "User");
        zoneRef.setValue(data).addOnCompleteListener(task -> {
            syncProgress.setVisibility(View.GONE);
            if (task.isSuccessful()) {
                Toast.makeText(MainActivity.this, getString(R.string.status_updated), Toast.LENGTH_SHORT).show();
                updateUI();
            } else {
                Toast.makeText(MainActivity.this, "Failed to update status", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateUI() {
        mainHandler.post(() -> {
            if (powerStatus) {
                statusValue.setText(R.string.power_on);
                statusContainer.setBackgroundColor(getColor(R.color.power_on_bg));
                statusValue.setTextColor(getColor(R.color.power_on_text));
                liveIndicator.setBackground(getDrawable(R.drawable.status_indicator_on));
            } else {
                statusValue.setText(R.string.power_off);
                statusContainer.setBackgroundColor(getColor(R.color.power_off_bg));
                statusValue.setTextColor(getColor(R.color.power_off_text));
                liveIndicator.setBackground(getDrawable(R.drawable.status_indicator_off));
            }
            updateFreshness();
        });
    }

    private void updateFreshness() {
        long minutesAgo = (System.currentTimeMillis() - lastUpdateTime) / 60000;
        if (minutesAgo == 0) {
            freshness.setText("Just now");
        } else if (minutesAgo < 60) {
            freshness.setText(minutesAgo + " minute" + (minutesAgo > 1 ? "s" : "") + " ago");
        } else {
            long hoursAgo = minutesAgo / 60;
            freshness.setText(hoursAgo + " hour" + (hoursAgo > 1 ? "s" : "") + " ago");
        }
    }

    private void startFreshnessUpdater() {
        freshnessTimer = new Timer();
        freshnessTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                updateFreshness();
            }
        }, 0, 30000); // Update every 30 seconds
    }

    private String sanitizeZoneName(String zone) {
        return zone.replaceAll("[^a-zA-Z0-9]", "_").toLowerCase();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (freshnessTimer != null) {
            freshnessTimer.cancel();
        }
    }

    // Data class for Firebase
    public static class PowerStatusData {
        public boolean status;
        public long timestamp;
        public String updatedBy;

        public PowerStatusData() {}

        public PowerStatusData(boolean status, long timestamp, String updatedBy) {
            this.status = status;
            this.timestamp = timestamp;
            this.updatedBy = updatedBy;
        }
    }
}
