const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

const withAndroidPermissions = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    const permissionsToAdd = [
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.PACKAGE_USAGE_STATS',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.QUERY_ALL_PACKAGES',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.WAKE_LOCK'
    ];
    permissionsToAdd.forEach(permission => {
      AndroidConfig.Permissions.addPermission(androidManifest, permission);
    });
    return config;
  });
};

module.exports = withAndroidPermissions;
