interface Props {
  onConnect: () => void;
  connecting: boolean;
  error: string | null;
}

export function ConnectScreen({ onConnect, connecting, error }: Props) {
  const supported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

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

        {!supported && (
          <p className="error">
            Web Bluetooth is not supported. Use Chrome / Edge on Android, macOS, or Windows.
          </p>
        )}

        {error && <p className="error">{error}</p>}

        <button
          className="btn-connect"
          onClick={onConnect}
          disabled={connecting || !supported}
        >
          {connecting ? 'Connecting…' : 'Connect Band'}
        </button>
      </div>
    </div>
  );
}
