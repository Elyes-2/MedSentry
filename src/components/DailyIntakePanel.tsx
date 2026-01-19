import { useMedicine } from '../context/MedicineContext';
import { Sun, Moon, Pill, Clock } from 'lucide-react';

interface TimeSlot {
    label: string;
    icon: typeof Sun;
    colorClass: string;
    bgClass: string;
    getDose: (med: { morning_dose: number; lunch_dose: number; night_dose: number }) => number;
    time: string;
}

const TIME_SLOTS: TimeSlot[] = [
    {
        label: 'Morning',
        icon: Sun,
        colorClass: 'text-blue-600 dark:text-blue-400',
        bgClass: 'border-l-4 border-blue-500 bg-blue-500/5',
        getDose: (med) => med.morning_dose,
        time: '8:00 AM'
    },
    {
        label: 'Noon',
        icon: Sun,
        colorClass: 'text-orange-600 dark:text-orange-400',
        bgClass: 'border-l-4 border-orange-500 bg-orange-500/5',
        getDose: (med) => med.lunch_dose,
        time: '12:00 PM'
    },
    {
        label: 'Night',
        icon: Moon,
        colorClass: 'text-purple-600 dark:text-purple-400',
        bgClass: 'border-l-4 border-purple-500 bg-purple-500/5',
        getDose: (med) => med.night_dose,
        time: '8:00 PM'
    }
];

export function DailyIntakePanel() {
    const { medicines } = useMedicine();

    const totalDailyPills = medicines.reduce((acc, med) => {
        return acc + med.morning_dose + med.lunch_dose + med.night_dose;
    }, 0);

    return (
        <div className="glass-panel p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} className="text-cyan-500" /> Daily Intake
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Pill size={12} />
                    <span className="font-mono">{totalDailyPills}</span>
                    <span>pills/day</span>
                </div>
            </div>

            <div className="space-y-3">
                {TIME_SLOTS.map((slot) => {
                    const medsForSlot = medicines
                        .filter((med) => slot.getDose(med) > 0)
                        .map((med) => ({
                            name: med.name,
                            dose: slot.getDose(med)
                        }));

                    const Icon = slot.icon;

                    return (
                        <div
                            key={slot.label}
                            className={`${slot.bgClass} p-3 transition-all`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon size={14} className={slot.colorClass} />
                                    <span className={`text-xs font-bold uppercase tracking-wide ${slot.colorClass}`}>
                                        {slot.label}
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono">{slot.time}</span>
                            </div>

                            {medsForSlot.length > 0 ? (
                                <div className="space-y-1">
                                    {medsForSlot.map((med) => (
                                        <div
                                            key={med.name}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-[var(--text-secondary)] truncate max-w-[140px]">
                                                {med.name}
                                            </span>
                                            <span className="font-mono text-[var(--text-primary)] flex items-center gap-1">
                                                <span className="text-gray-500">×</span>
                                                <span className={slot.colorClass}>{med.dose}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-600 italic">No pills scheduled</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
