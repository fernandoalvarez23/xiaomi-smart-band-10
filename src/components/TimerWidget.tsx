import { useState } from 'react';
import { useTimer } from '../hooks/useTimer';

const PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
];

export function TimerWidget() {
  const { remaining, running, start, cancel } = useTimer();
  const [custom, setCustom] = useState('');

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-widget">
      <h2>Timer & Alert</h2>
      <p className="timer-desc">
        Set a countdown — your band will vibrate when time is up.
      </p>

      {running ? (
        <div className="timer-running">
          <span className="timer-display">{formatTime(remaining)}</span>
          <button className="btn-action cancel" onClick={cancel}>
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="timer-presets">
            {PRESETS.map((p) => (
              <button
                key={p.seconds}
                className="btn-preset"
                onClick={() => start(p.seconds)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="timer-custom">
            <input
              type="number"
              placeholder="Seconds"
              min={1}
              max={3600}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
            <button
              className="btn-action"
              disabled={!custom || Number(custom) < 1}
              onClick={() => {
                start(Number(custom));
                setCustom('');
              }}
            >
              Start
            </button>
          </div>
        </>
      )}
    </div>
  );
}
