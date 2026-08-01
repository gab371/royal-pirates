/**
 * Host debug (`window.__PIRATES_DEBUG__` + DebugPanel).
 * - Off if `VITE_ALLOW_DEBUG_MODE=false`
 * - On if `VITE_ALLOW_DEBUG_MODE=true`
 * - Default: on in `import.meta.env.DEV` only
 */
export function isDebugModeAllowed(): boolean {
  const flag = String(import.meta.env.VITE_ALLOW_DEBUG_MODE ?? "")
    .trim()
    .toLowerCase();
  if (flag === "false" || flag === "0") return false;
  if (flag === "true" || flag === "1") return true;
  return import.meta.env.DEV;
}
