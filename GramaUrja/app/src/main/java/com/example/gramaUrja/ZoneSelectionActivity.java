package com.example.gramaUrja;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ListView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class ZoneSelectionActivity extends AppCompatActivity {
    private static final String PREFS_NAME = "GramaUrjaPrefs";
    private static final String SELECTED_ZONE = "selected_zone";

    private RecyclerView zoneList;
    private Button btnConfirm, btnCancel;
    private ZoneAdapter adapter;
    private List<Zone> zones;
    private String selectedZone;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_zone_selection);

        initializeViews();
        loadZones();
        setupAdapter();
    }

    private void initializeViews() {
        zoneList = findViewById(R.id.zone_list);
        btnConfirm = findViewById(R.id.btn_zone_confirm);
        btnCancel = findViewById(R.id.btn_zone_cancel);

        btnConfirm.setOnClickListener(v -> saveZoneAndFinish());
        btnCancel.setOnClickListener(v -> finish());
    }

    private void loadZones() {
        zones = new ArrayList<>();
        zones.add(new Zone("Village Main", "Central transformer"));
        zones.add(new Zone("North Field", "North agricultural zone"));
        zones.add(new Zone("South Plot", "South irrigation area"));
        zones.add(new Zone("East Boundary", "East perimeter"));
        zones.add(new Zone("West Junction", "West connection point"));
        zones.add(new Zone("Market Area", "Central market zone"));

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        selectedZone = prefs.getString(SELECTED_ZONE, "Village Main");
    }

    private void setupAdapter() {
        zoneList.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ZoneAdapter(zones, selectedZone, zone -> {
            selectedZone = zone.name;
            adapter.setSelectedZone(selectedZone);
        });
        zoneList.setAdapter(adapter);
    }

    private void saveZoneAndFinish() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putString(SELECTED_ZONE, selectedZone).apply();
        Toast.makeText(this, "Zone selected: " + selectedZone, Toast.LENGTH_SHORT).show();
        finish();
    }

    // Zone model class
    public static class Zone {
        public String name;
        public String description;

        public Zone(String name, String description) {
            this.name = name;
            this.description = description;
        }
    }
}
