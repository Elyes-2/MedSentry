import { MedicineProvider, useMedicine } from './context/MedicineContext';
import { MedicineForm } from './components/MedicineForm';
import { MedicineCard } from './components/MedicineCard';
import { StatsPanel } from './components/StatsPanel';
import { Activity, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import type { Medication } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-white/10 hover:border-cyan-500/50 hover:bg-white/5 transition-all group"
      title="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-gray-400 group-hover:text-yellow-400 transition-colors" />
      ) : (
        <Moon size={20} className="text-gray-400 group-hover:text-cyan-600 transition-colors" />
      )}
    </button>
  );
}

function Dashboard() {
  const { medicines, deleteMedicine, restockMedicine, takeDose } = useMedicine();
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const totalMeds = medicines.length;

  return (
    <div className="min-h-screen p-8 pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end max-w-5xl mx-auto border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600 mb-2 tracking-tight">
            MED.OS
          </h1>
          <p className="text-gray-500 font-mono text-sm tracking-widest uppercase flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> System Online v2.0
          </p>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <button
            onClick={async () => {
              try {
                const res = await window.ipcRenderer.invoke('medications:trigger-test-alert');
                if (res.alerted.length > 0) {
                  alert(`Alert Triggered for: ${res.alerted.join(', ')}. Check your email/terminal.`);
                } else {
                  alert("No medications are below your alert thresholds. No email sent.");
                }
              } catch (e) {
                console.error(e);
                alert("Error triggering test. Check console.");
              }
            }}
            className="text-xs border border-white/10 hover:border-cyan-500/50 px-3 py-1 rounded-full text-gray-500 hover:text-cyan-400 transition-all font-mono uppercase tracking-tighter"
          >
            Run Alert Test
          </button>
          <div className="text-right hidden md:block border-l border-white/10 pl-6 dark:text-white text-gray-800">
            <div className="text-2xl font-mono font-bold">{totalMeds}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Active Prescriptions</div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form / Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <MedicineForm
                initialData={editingMed}
                onClose={() => setEditingMed(null)}
              />

              <StatsPanel />

              {/* Mini List */}
              <div className="glass-panel p-6 mt-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} /> Inventory Stream
                </h3>
                <div className="space-y-3">
                  {medicines.map(med => (
                    <div key={med.id} className="flex justify-between items-center text-sm group">
                      <span className="text-gray-400 group-hover:text-cyan-500 transition-colors cursor-default">{med.name}</span>
                      <span className={`font-mono ${med.total_stock < med.alert_threshold ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                        {med.total_stock}
                      </span>
                    </div>
                  ))}
                  {medicines.length === 0 && <span className="text-gray-600 text-sm italic">No data streams active.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Cards Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medicines.map(med => (
                <MedicineCard
                  key={med.id}
                  medicine={med}
                  onRestock={restockMedicine}
                  onDelete={deleteMedicine}
                  onTakeDose={takeDose}
                  onEdit={setEditingMed}
                />
              ))}
            </div>

            {medicines.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-gray-600 border border-dashed border-white/10 rounded-3xl">
                <p>Awaiting Input...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div >
  );
}

function App() {
  return (
    <ThemeProvider>
      <MedicineProvider>
        <Dashboard />
      </MedicineProvider>
    </ThemeProvider>
  );
}

export default App;
