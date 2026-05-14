package com.example.gramaUrja;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RadioButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class ZoneAdapter extends RecyclerView.Adapter<ZoneAdapter.ZoneViewHolder> {
    private final List<ZoneSelectionActivity.Zone> zones;
    private String selectedZone;
    private final OnZoneSelectedListener listener;

    public interface OnZoneSelectedListener {
        void onZoneSelected(String zoneName);
    }

    public ZoneAdapter(List<ZoneSelectionActivity.Zone> zones, String selectedZone, OnZoneSelectedListener listener) {
        this.zones = zones;
        this.selectedZone = selectedZone;
        this.listener = listener;
    }

    public void setSelectedZone(String zone) {
        this.selectedZone = zone;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ZoneViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_zone, parent, false);
        return new ZoneViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ZoneViewHolder holder, int position) {
        ZoneSelectionActivity.Zone zone = zones.get(position);
        holder.zoneName.setText(zone.name);
        holder.zoneDescription.setText(zone.description);
        holder.radioButton.setChecked(zone.name.equals(selectedZone));

        holder.itemView.setOnClickListener(v -> {
            selectedZone = zone.name;
            listener.onZoneSelected(zone.name);
            notifyDataSetChanged();
        });
    }

    @Override
    public int getItemCount() {
        return zones.size();
    }

    public static class ZoneViewHolder extends RecyclerView.ViewHolder {
        private final TextView zoneName;
        private final TextView zoneDescription;
        private final RadioButton radioButton;

        public ZoneViewHolder(@NonNull View itemView) {
            super(itemView);
            zoneName = itemView.findViewById(R.id.zone_name);
            zoneDescription = itemView.findViewById(R.id.zone_description);
            radioButton = itemView.findViewById(R.id.radio_button);
        }
    }
}
