import { useMedicine } from '../context/MedicineContext';
import { DollarSign, TrendingUp } from 'lucide-react';

export function StatsPanel() {
    const { medicines } = useMedicine();

    // Calculate financials
    const dailyCost = medicines.reduce((acc, med) => {
        const dailyPills = med.morning_dose + med.lunch_dose + med.night_dose;
        const costPerPill = med.price_cents / med.package_size;
        return acc + (dailyPills * costPerPill);
    }, 0);

    const monthlyCost = dailyCost * 30;

    return (
        <div className="glass-panel p-6 mt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={14} /> Financial Forecast
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg-input)] dark:bg-white/5 rounded-lg p-3 border border-[var(--border-color)]">
                    <div className="text-xs text-[var(--text-secondary)] uppercase">Daily</div>
                    <div className="text-xl font-mono text-[var(--text-primary)] flex items-center">
                        <DollarSign size={16} className="text-emerald-500" />
                        {(dailyCost / 100).toFixed(2)}
                    </div>
                </div>
                <div className="bg-[var(--bg-input)] dark:bg-white/5 rounded-lg p-3 border border-[var(--border-color)]">
                    <div className="text-xs text-[var(--text-secondary)] uppercase">Monthly</div>
                    <div className="text-xl font-mono text-[var(--text-primary)] flex items-center">
                        <DollarSign size={16} className="text-purple-500" />
                        {(monthlyCost / 100).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}
