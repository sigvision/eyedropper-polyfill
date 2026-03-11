export function isEyeDropperSupported(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const linuxChromeBug = userAgent.includes('linux') && userAgent.includes('chrome')
  const nativeEyeDropperExist = 'EyeDropper' in window;
  return !linuxChromeBug && nativeEyeDropperExist;
}
