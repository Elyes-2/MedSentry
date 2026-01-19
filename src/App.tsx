import { MedicineProvider, useMedicine } from './context/MedicineContext';
import { MedicineForm } from './components/MedicineForm';
import { MedicineCard } from './components/MedicineCard';
import { StatsPanel } from './components/StatsPanel';
import { DailyIntakePanel } from './components/DailyIntakePanel';
import { Activity, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import type { Medication } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={() => {
        console.log('[ThemeToggle] Button clicked');
        toggleTheme();
      }}
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

import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';

// Inner component to use the hook
function MainContent() {
  const { medicines, deleteMedicine, restockMedicine, takeDose } = useMedicine();
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const { showToast } = useToast();
  const totalMeds = medicines.length;

  const handleTestAlert = async () => {
    try {
      const res = await window.ipcRenderer.invoke('medications:trigger-test-alert');
      if (res.alerted.length > 0) {
        showToast(`Alert Triggered for: ${res.alerted.join(', ')}`, 'success');
      } else {
        showToast("No medications are below your alert thresholds.", 'info');
      }
    } catch (e) {
      console.error(e);
      showToast("Error triggering test. Check console.", 'error');
    }
  };

  return (
    <div className="min-h-screen p-8 pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end max-w-5xl mx-auto border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600 mb-2 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>
            MedSentry
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <button
            onClick={handleTestAlert}
            className="text-xs border border-[var(--border-color)] px-3 py-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all font-mono uppercase tracking-tighter"
          >
            Run Alert Test
          </button>
          <div className="text-right hidden md:block border-l border-[var(--border-color)] pl-6 text-[var(--text-primary)]">
            <div className="text-2xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{totalMeds}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Active Prescriptions</div>
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

              <DailyIntakePanel />
              <StatsPanel />

              {/* Mini List */}
              <div className="glass-panel p-6 mt-6">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                  <Activity size={14} className="text-[var(--accent-cyan)]" /> Inventory Stream
                </h3>
                <div className="space-y-3">
                  {medicines.map(med => {
                    const p = Math.min((med.total_stock / med.package_size) * 100, 100);
                    const isLow = med.total_stock <= med.alert_threshold;
                    return (
                      <div key={med.id} className="group p-2 rounded-xl transition-all cursor-default">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[var(--text-secondary)] font-medium group-hover:text-[var(--accent-cyan)] transition-colors cursor-default truncate flex-1">{med.name}</span>
                          <span className={`font-mono font-bold ${isLow ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)] opacity-40'}`}>
                            {med.total_stock}
                          </span>
                        </div>
                        <div className="h-[2px] w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${isLow ? 'bg-red-500' : 'bg-cyan-500/40'}`}
                            style={{ width: `${p}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
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
      <ToastProvider>
        <MedicineProvider>
          <MainContent />
          <ToastContainer />
        </MedicineProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
