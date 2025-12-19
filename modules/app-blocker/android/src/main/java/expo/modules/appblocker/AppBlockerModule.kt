package expo.modules.appblocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import java.io.ByteArrayOutputStream
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {
  private fun getAppIcon(packageName: String): String {
    try {
        val pm = context.packageManager
        val drawable = pm.getApplicationIcon(packageName)
        val bitmap = if (drawable is BitmapDrawable) {
            drawable.bitmap
        } else {
            val bitmap = Bitmap.createBitmap(drawable.intrinsicWidth, drawable.intrinsicHeight, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            bitmap
        }
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
        val byteArray = stream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    } catch (e: Exception) {
        return ""
    }
  }

  override fun definition() = ModuleDefinition {
    Name("AppBlocker")

    AsyncFunction("getApps") { promise: Promise ->
      try {
        val pm = context.packageManager
        val packages = pm.getInstalledPackages(0)
        val apps = mutableListOf<Map<String, Any>>()

        for (pkg in packages) {
          // Check if app is launchable
          if (pm.getLaunchIntentForPackage(pkg.packageName) != null) {
             val appInfo = pkg.applicationInfo?.let { info ->
               val isSystem = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0
               val isUpdatedSystem = (info.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0
               
               mapOf(
                 "packageName" to pkg.packageName,
                 "label" to info.loadLabel(pm).toString(),
                 "icon" to getAppIcon(pkg.packageName),
                 "isSystem" to (isSystem && !isUpdatedSystem)
               )
             }
             if (appInfo != null) {
               apps.add(appInfo)
             }
          }
        }
        promise.resolve(apps)
      } catch (e: Exception) {
        promise.reject("ERR_GET_APPS", "Failed to get apps: ${e.message}", e)
      }
    }

    Function("checkOverlayPermission") {
      return@Function Settings.canDrawOverlays(context)
    }

    Function("requestOverlayPermission") {
      val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + context.packageName))
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("checkUsageStatsPermission") {
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
      return@Function mode == AppOpsManager.MODE_ALLOWED
    }

    Function("requestUsageStatsPermission") {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("startBlocking") { allowedApps: List<String>, duration: Double ->
      try {
          val endTime = System.currentTimeMillis() + duration.toLong()
          
          // Save to SharedPreferences for BootReceiver
          val prefs = context.getSharedPreferences("BlockitPrefs", Context.MODE_PRIVATE)
          val editor = prefs.edit()
          editor.putBoolean("isActive", true)
          editor.putLong("endTime", endTime)
          editor.putStringSet("allowedApps", allowedApps.toHashSet())
          editor.apply()

          val intent = Intent(context, AppBlockerService::class.java)
          intent.putStringArrayListExtra(AppBlockerService.EXTRA_ALLOWED_APPS, ArrayList(allowedApps))
          
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
          } else {
            context.startService(intent)
          }
      } catch (e: Exception) {
          e.printStackTrace()
          // We can re-throw or just log. Re-throwing allows JS to catch.
          throw e
      }
    }

    Function("stopBlocking") {
      val prefs = context.getSharedPreferences("BlockitPrefs", Context.MODE_PRIVATE)
      val editor = prefs.edit()
      editor.putBoolean("isActive", false)
      editor.apply()

      val intent = Intent(context, AppBlockerService::class.java)
      context.stopService(intent)
    }

    Function("getDefaultDialerPackage") {
      try {
          val intent = Intent(Intent.ACTION_DIAL)
          val result = context.packageManager.resolveActivity(intent, 0)
          return@Function result?.activityInfo?.packageName ?: ""
      } catch (e: Exception) {
          return@Function ""
      }
    }

    Function("checkAdminPermission") {
      val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as android.app.admin.DevicePolicyManager
      val adminComponent = android.content.ComponentName(context, "expo.modules.appblocker.AppAdminReceiver")
      return@Function dpm.isAdminActive(adminComponent)
    }

    Function("requestAdminPermission") {
      try {
        val adminComponent = android.content.ComponentName(context, "expo.modules.appblocker.AppAdminReceiver")
        val intent = Intent(android.app.admin.DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
        intent.putExtra(android.app.admin.DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent)
        intent.putExtra(android.app.admin.DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Uninstallation protection requires Device Admin rights.")
        
        val activity = appContext.currentActivity
        if (activity != null) {
          activity.startActivity(intent)
        } else {
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          context.startActivity(intent)
        }
      } catch (e: Exception) {
        e.printStackTrace()
      }
    }

    Function("launchApp") { packageName: String ->
      try {
        val pm = context.packageManager
        val intent = pm.getLaunchIntentForPackage(packageName)
        if (intent != null) {
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          context.startActivity(intent)
          return@Function true
        }
        return@Function false
      } catch (e: Exception) {
        return@Function false
      }
    }
  }
  
  private val context
    get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }
}
