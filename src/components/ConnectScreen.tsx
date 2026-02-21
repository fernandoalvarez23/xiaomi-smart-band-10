interface Props {
  onConnect: () => void;
  connecting: boolean;
  error: string | null;
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function ConnectScreen({ onConnect, connecting, error }: Props) {
  const supported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  const isiOS = isIOS();

  return (
    <div className="connect-screen">
      <div className="connect-card">
        <div className="band-illustration">
          <svg viewBox="0 0 80 160" width="80" height="160">
            <rect x="15" y="10" width="50" height="140" rx="25" fill="#222" stroke="#ff6900" strokeWidth="2" />
            <rect x="22" y="30" width="36" height="60" rx="4" fill="#111" />
            <circle cx="40" cy="110" r="6" fill="none" stroke="#555" strokeWidth="1.5" />
            {/* pulse animation */}
            <circle cx="40" cy="55" r="8" fill="#ff6900" opacity="0.3">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="55" r="4" fill="#ff6900" />
          </svg>
        </div>

        <h1>Xiaomi Smart Band 10</h1>
        <p className="subtitle">Connect via Bluetooth to monitor your health data</p>

        {!supported && isiOS && (
          <div className="compat-notice ios-notice">
            <p className="compat-title">iPhone / iPad detected</p>
            <p>Safari and Chrome on iOS do not support Web Bluetooth.
              To connect your band from this device, use the
              {' '}<a href="https://apps.apple.com/app/bluefy-web-ble-browser/id1492822055" target="_blank" rel="noopener noreferrer">Bluefy</a> browser
              (free on the App Store). It is the only iOS browser that supports Web Bluetooth.</p>
          </div>
        )}

        {!supported && !isiOS && (
          <p className="error">
            Web Bluetooth is not supported in this browser. Use Chrome or Edge on Android, macOS, or Windows.
          </p>
        )}

        {error && (
          <div className="compat-notice error-notice">
            <p className="compat-title">Connection failed</p>
            {error.includes('CONNECTION_FAILED') ? (
              <>
                <p>Could not establish a connection to the band. This usually happens when:</p>
                <ul className="troubleshoot-list">
                  <li><strong>Mi Fitness app is connected</strong> — BLE only allows one connection at a time. Close or force-stop the Mi Fitness / Zepp Life app, then try again.</li>
                  <li><strong>Band is out of range</strong> — Keep the band close to your device.</li>
                  <li><strong>Bluetooth is off</strong> — Check that Bluetooth is enabled in Settings.</li>
                </ul>
              </>
            ) : error.includes('User cancelled') || error.includes('chooser') ? (
              <p>Pairing was cancelled. Tap "Connect Band" to try again.</p>
            ) : (
              <p>{error}</p>
            )}
          </div>
        )}

        <button
          className="btn-connect"
          onClick={onConnect}
          disabled={connecting || !supported}
        >
          {connecting ? 'Connecting…' : error ? 'Retry Connection' : 'Connect Band'}
        </button>

        {supported && !error && (
          <p className="compat-hint">
            Ensure Bluetooth is enabled and your band is nearby
          </p>
        )}
      </div>
    </div>
  );
}
