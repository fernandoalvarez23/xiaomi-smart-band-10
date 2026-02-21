import type { BandData } from '../services/ble';
import { MetricCard } from './MetricCard';
import { TimerWidget } from './TimerWidget';

interface Props {
  data: BandData;
  onDisconnect: () => void;
  onVibrate: () => void;
}

export function Dashboard({ data, onDisconnect, onVibrate }: Props) {
  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1>{data.deviceName}</h1>
          <span className="status-dot connected" />
          <span className="status-text">Connected</span>
        </div>
        <button className="btn-disconnect" onClick={onDisconnect}>
          Disconnect
        </button>
      </header>

      <div className="metrics-grid">
        <MetricCard
          label="Heart Rate"
          value={data.heartRate}
          unit="bpm"
          icon={
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#ff4d6a">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          }
          pulse={data.heartRate !== null}
        />
        <MetricCard
          label="Steps"
          value={data.steps}
          unit="steps"
          icon={
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#4dc9f6">
              <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 7.3l1 4.7 5.1-2.2V21h2v-8l-3.3 1.4-.6-2.9 2.5-2.3V6h-2L12 8.6l-2.1 4.2z" />
            </svg>
          }
        />
        <MetricCard
          label="Battery"
          value={data.battery}
          unit="%"
          icon={
            <svg viewBox="0 0 24 24" width="28" height="28" fill={batteryColor(data.battery)}>
              <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.34C7 21.4 7.6 22 8.33 22h7.34c.73 0 1.33-.6 1.33-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
            </svg>
          }
        />
      </div>

      <div className="actions-row">
        <button className="btn-action vibrate" onClick={onVibrate}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z" />
          </svg>
          Vibrate
        </button>
      </div>

      <TimerWidget />
    </div>
  );
}

function batteryColor(level: number | null): string {
  if (level === null) return '#888';
  if (level > 50) return '#4caf50';
  if (level > 20) return '#ff9800';
  return '#f44336';
}
