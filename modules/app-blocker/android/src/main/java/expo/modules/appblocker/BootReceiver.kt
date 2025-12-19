package expo.modules.appblocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            // Check if we need to resume a session
            // We need to access Shared Preferences where we store session state
            // Note: Expo's AsyncStorage stores data in a specific way, but we might have our own native pref if we want pure native resilience.
            // For now, let's just launch the service if we can detect a session is supposed to be active.
            
            // However, since we are using Zustand with AsyncStorage, reading that from Native Java/Kotlin is tricky (it's a JSON blob).
            // A robust way is to have the React Native side write a simple boolean flag to SharedPreferences when a session starts.
            
            // Let's assume we have a "BlockitPrefs" 
            val prefs: SharedPreferences = context.getSharedPreferences("BlockitPrefs", Context.MODE_PRIVATE)
            val isSessionActive = prefs.getBoolean("isActive", false)
            val endTime = prefs.getLong("endTime", 0)
            
            if (isSessionActive && System.currentTimeMillis() < endTime) {
                val serviceIntent = Intent(context, AppBlockerService::class.java)
                
                // We need to pass the allowed apps too.
                val allowedAppsSet = prefs.getStringSet("allowedApps", emptySet())
                val allowedAppsList = ArrayList(allowedAppsSet ?: emptySet())
                serviceIntent.putStringArrayListExtra(AppBlockerService.EXTRA_ALLOWED_APPS, allowedAppsList)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
                
                // Also bring the app to front to show the status
                 val appIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                 if (appIntent != null) {
                     appIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                     context.startActivity(appIntent)
                 }
            }
        }
    }
}
