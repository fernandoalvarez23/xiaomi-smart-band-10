import { ConnectScreen } from './components/ConnectScreen';
import { Dashboard } from './components/Dashboard';
import { useBand } from './hooks/useBand';
import './App.css';

export default function App() {
  const { data, connecting, error, connect, disconnect, vibrate } = useBand();

  if (!data.connected) {
    return <ConnectScreen onConnect={connect} connecting={connecting} error={error} />;
  }

  return <Dashboard data={data} onDisconnect={disconnect} onVibrate={vibrate} />;
}
