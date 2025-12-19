import { NativeModule, requireNativeModule } from 'expo';

import { AppBlockerModuleEvents } from './AppBlocker.types';

export type AppInfo = {
  packageName: string;
  label: string;
  icon: string;
  isSystem: boolean;
};

declare class AppBlockerModule extends NativeModule<AppBlockerModuleEvents> {
  getApps(): Promise<AppInfo[]>;
  checkOverlayPermission(): boolean;
  requestOverlayPermission(): void;
  checkUsageStatsPermission(): boolean;
  requestUsageStatsPermission(): void;
  checkAdminPermission(): boolean;
  requestAdminPermission(): void;
  startBlocking(allowedApps: string[], duration: number): void;
  stopBlocking(): void;
  getDefaultDialerPackage(): string;
  launchApp(packageName: string): boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AppBlockerModule>('AppBlocker');
