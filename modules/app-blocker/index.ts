import AppBlockerModule, { AppInfo } from './src/AppBlockerModule';

export { AppInfo };

export async function getApps(): Promise<AppInfo[]> {
    return await AppBlockerModule.getApps();
}

export function checkOverlayPermission(): boolean {
    return AppBlockerModule.checkOverlayPermission();
}

export function requestOverlayPermission(): void {
    AppBlockerModule.requestOverlayPermission();
}

export function checkUsageStatsPermission(): boolean {
    return AppBlockerModule.checkUsageStatsPermission();
}

export function requestUsageStatsPermission(): void {
    AppBlockerModule.requestUsageStatsPermission();
}

export function checkAdminPermission(): boolean {
    return AppBlockerModule.checkAdminPermission();
}

export function requestAdminPermission(): void {
    AppBlockerModule.requestAdminPermission();
}

export function startBlocking(allowedApps: string[], duration: number): void {
    AppBlockerModule.startBlocking(allowedApps, duration);
}

export function stopBlocking(): void {
    AppBlockerModule.stopBlocking();
}

export function getDefaultDialerPackage(): string {
    return AppBlockerModule.getDefaultDialerPackage();
}

export function launchApp(packageName: string): boolean {
    return AppBlockerModule.launchApp(packageName);
}
