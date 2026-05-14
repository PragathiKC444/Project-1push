# Proguard rules for Grama-Urja app

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep data classes
-keep class com.example.gramaUrja.MainActivity$PowerStatusData { *; }

# General Android
-keep public class android.** { *; }
-keep public class androidx.** { *; }
