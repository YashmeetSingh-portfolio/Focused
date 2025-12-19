package expo.modules.appblocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import java.util.SortedMap
import java.util.TreeMap

class AppBlockerService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private var allowedApps: List<String> = emptyList()
    private var isRunning = false
    private val CHECK_INTERVAL = 500L // Check every 500ms

    companion object {
        const val CHANNEL_ID = "AppBlockerChannel"
        const val EXTRA_ALLOWED_APPS = "allowed_apps"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val apps = intent?.getStringArrayListExtra(EXTRA_ALLOWED_APPS)
        if (apps != null) {
            allowedApps = apps
        }

        if (!isRunning) {
            isRunning = true
            createNotificationChannel()
            val notification = createNotification()
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(1, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
            } else {
                startForeground(1, notification)
            }
            startBlockingLoop()
        }

        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "App Blocker Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Focus Mode Active")
            .setContentText("Blocking distracting apps...")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .build()
    }

    private fun startBlockingLoop() {
        handler.post(object : Runnable {
            override fun run() {
                if (!isRunning) return
                checkAndBlock()
                handler.postDelayed(this, CHECK_INTERVAL)
            }
        })
    }

    private fun checkAndBlock() {
        val currentApp = getForegroundApp()
        if (currentApp != null && currentApp != packageName && !allowedApps.contains(currentApp)) {
            // Block it!
            // Bring our app to front
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(intent)
        }
    }

    private fun getForegroundApp(): String? {
        val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val time = System.currentTimeMillis()
        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 1000, time)

        if (stats != null && stats.isNotEmpty()) {
            val mySortedMap: SortedMap<Long, android.app.usage.UsageStats> = TreeMap()
            for (usageStats in stats) {
                mySortedMap[usageStats.lastTimeUsed] = usageStats
            }
            if (mySortedMap.isNotEmpty()) {
                return mySortedMap[mySortedMap.lastKey()]?.packageName
            }
        }
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        handler.removeCallbacksAndMessages(null)
    }
}
