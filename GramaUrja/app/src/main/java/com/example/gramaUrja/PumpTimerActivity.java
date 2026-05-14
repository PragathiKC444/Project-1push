package com.example.gramaUrja;

import android.os.Bundle;
import android.os.CountDownTimer;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class PumpTimerActivity extends AppCompatActivity {
    private Spinner cropSpinner;
    private EditText durationInput;
    private Button btnStart, btnCancel;
    private TextView timerDisplay;

    private CountDownTimer countDownTimer;
    private long timeLeftInMillis;
    private boolean timerRunning = false;

    // Crop water requirements (minutes per hour)
    private final int[] cropDurations = {30, 45, 60, 90}; // Default values
    private final String[] crops = {"Rice", "Wheat", "Sugarcane", "Cotton"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_pump_timer);

        initializeViews();
        setupCropSpinner();
    }

    private void initializeViews() {
        cropSpinner = findViewById(R.id.crop_spinner);
        durationInput = findViewById(R.id.duration_input);
        btnStart = findViewById(R.id.btn_timer_start);
        btnCancel = findViewById(R.id.btn_timer_cancel);
        timerDisplay = findViewById(R.id.timer_display);

        btnStart.setOnClickListener(v -> startTimer());
        btnCancel.setOnClickListener(v -> {
            if (timerRunning) {
                countDownTimer.cancel();
                timerRunning = false;
            }
            finish();
        });
    }

    private void setupCropSpinner() {
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_item, crops);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        cropSpinner.setAdapter(adapter);
    }

    private void startTimer() {
        String durationStr = durationInput.getText().toString().trim();
        if (durationStr.isEmpty()) {
            Toast.makeText(this, "Please enter pump duration", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            long durationMinutes = Long.parseLong(durationStr);
            if (durationMinutes <= 0) {
                Toast.makeText(this, "Duration must be greater than 0", Toast.LENGTH_SHORT).show();
                return;
            }

            timeLeftInMillis = durationMinutes * 60 * 1000;
            startCountDownTimer();
            timerRunning = true;
            durationInput.setEnabled(false);
            cropSpinner.setEnabled(false);
            btnStart.setEnabled(false);

        } catch (NumberFormatException e) {
            Toast.makeText(this, "Invalid duration", Toast.LENGTH_SHORT).show();
        }
    }

    private void startCountDownTimer() {
        countDownTimer = new CountDownTimer(timeLeftInMillis, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                timeLeftInMillis = millisUntilFinished;
                updateTimerDisplay();
            }

            @Override
            public void onFinish() {
                timerRunning = false;
                timerDisplay.setText("00:00");
                Toast.makeText(PumpTimerActivity.this, "Pump timer completed!", Toast.LENGTH_SHORT).show();
                resetUI();
            }
        }.start();
    }

    private void updateTimerDisplay() {
        long minutes = timeLeftInMillis / 1000 / 60;
        long seconds = (timeLeftInMillis / 1000) % 60;
        String timeFormatted = String.format("%02d:%02d", minutes, seconds);
        timerDisplay.setText(timeFormatted);
    }

    private void resetUI() {
        durationInput.setEnabled(true);
        cropSpinner.setEnabled(true);
        btnStart.setEnabled(true);
        durationInput.setText("");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (countDownTimer != null) {
            countDownTimer.cancel();
        }
    }
}
