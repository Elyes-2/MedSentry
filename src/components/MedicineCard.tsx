import { format } from 'date-fns';
import { AlertCircle, Droplet, Clock, Trash2, ShoppingBag, Edit2, Sun } from 'lucide-react';
import { predictDepletion } from '../utils/calculations';
import type { Medication } from '../types';

interface MedicineCardProps {
    medicine: Medication;
    onRestock: (id: number) => void;
    onDelete: (id: number) => void;
    onTakeDose: (id: number, amount: number) => void;
    onEdit: (med: Medication) => void;
}

export function MedicineCard({ medicine, onRestock, onDelete, onTakeDose, onEdit }: MedicineCardProps) {
    const handleTakeDose = (e: React.MouseEvent, amount: number) => {
        e.stopPropagation();
        if (medicine.id) onTakeDose(medicine.id, amount);
    };
    const prediction = predictDepletion(medicine);
    const percentage = Math.min((medicine.total_stock / medicine.package_size) * 100, 100);

    // Status Colors (Gradients for Phase II)
    let statusColor = "bg-gradient-to-r from-emerald-400 to-emerald-600";
    let borderColor = "border-transparent";

    if (percentage < 25) {
        statusColor = "bg-gradient-to-r from-red-400 to-red-600";
        borderColor = "border-red-500/50";
    } else if (percentage < 50) {
        statusColor = "bg-gradient-to-r from-amber-400 to-amber-600";
    }

    return (
        <div className={`glass-panel p-6 relative group transition-all duration-300 hover:scale-[1.02] border ${borderColor}`}>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--card-title)' }}>
                        {medicine.name}
                    </h3>
                    <div className="flex gap-2 mt-3">
                        {medicine.morning_dose > 0 && <span className="tag-premium tag-blue">Morning: {medicine.morning_dose}</span>}
                        {medicine.lunch_dose > 0 && <span className="tag-premium tag-orange">Noon: {medicine.lunch_dose}</span>}
                        {medicine.night_dose > 0 && <span className="tag-premium tag-purple">Night: {medicine.night_dose}</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(medicine)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-cyan-600 dark:text-gray-500 dark:hover:text-cyan-400"
                        title="Edit Details"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => medicine.id && onDelete(medicine.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Stock Viz */}
            <div className="mb-6 relative">
                <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-[var(--text-secondary)]">Inventory</span>
                    <span className={percentage < 25 ? "text-red-500 dark:text-red-400 animate-pulse font-bold" : "text-gray-900 dark:text-white"}>
                        {medicine.total_stock} <span className="text-gray-400 dark:text-gray-600">/ {medicine.package_size}</span>
                    </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden border border-black/5 dark:border-white/5" style={{ backgroundColor: 'var(--bar-track)' }}>
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${statusColor}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Prediction Data */}
            <div className="rounded-xl p-4 mb-6 border border-[var(--border-color)] relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none" style={{ backgroundColor: 'var(--projection-bg)' }}>
                <div className={`absolute top-0 right-0 w-20 h-20 blur-[40px] opacity-20 pointer-events-none rounded-full ${percentage < 25 ? 'bg-red-500' : 'bg-blue-500'}`}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-cyan-600 dark:text-cyan-400" />
                        <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Projection</span>
                    </div>
                    {prediction.warning48h ? (
                        <div className="mb-2">
                            <div className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                                <AlertCircle size={16} /> CRITICAL LOW STOCK
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] mt-1">
                                Must restock by <span className="text-[var(--text-primary)] font-mono">{format(prediction.restockDate, 'MMM dd @ HH:mm')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-[var(--text-secondary)]">
                            Expected to last until <br />
                            <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                                {format(prediction.depletionDate, 'MMM do')}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 ml-2">({prediction.lastDoseTime})</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => medicine.id && onRestock(medicine.id)}
                    className="btn-primary flex items-center justify-center gap-2 text-sm py-3"
                >
                    <ShoppingBag size={16} /> RESTOCK
                </button>

                <div className="grid grid-cols-3 gap-1">
                    {medicine.morning_dose > 0 && (
                        <button onClick={(e) => handleTakeDose(e, medicine.morning_dose)} className="tag-premium tag-blue flex flex-col items-center justify-center gap-0.5 hover:scale-105 active:scale-95 transition-all h-full" title={`Take Morning Dose (${medicine.morning_dose})`} style={{ background: 'var(--input-btn)' }}>
                            <Sun size={12} /> <span className="text-[9px]">AM</span>
                        </button>
                    )}
                    {medicine.lunch_dose > 0 && (
                        <button onClick={(e) => handleTakeDose(e, medicine.lunch_dose)} className="tag-premium tag-orange flex flex-col items-center justify-center gap-0.5 hover:scale-105 active:scale-95 transition-all h-full" title={`Take Lunch Dose (${medicine.lunch_dose})`} style={{ background: 'var(--input-btn)' }}>
                            <Sun size={12} /> <span className="text-[9px]">NOON</span>
                        </button>
                    )}
                    {medicine.night_dose > 0 && (
                        <button onClick={(e) => handleTakeDose(e, medicine.night_dose)} className="tag-premium tag-purple flex flex-col items-center justify-center gap-0.5 hover:scale-105 active:scale-95 transition-all h-full" title={`Take Night Dose (${medicine.night_dose})`} style={{ background: 'var(--input-btn)' }}>
                            <Droplet size={12} /> <span className="text-[9px]">PM</span>
                        </button>
                    )}
                    {/* Fallback if no specific dose set */}
                    {medicine.morning_dose === 0 && medicine.lunch_dose === 0 && medicine.night_dose === 0 && (
                        <button
                            onClick={(e) => handleTakeDose(e, 1)}
                            className="tag-premium tag-cyan flex items-center justify-center col-span-3 hover:scale-[1.02] active:scale-98 transition-all h-full gap-2 p-2"
                        >
                            <Droplet size={14} /> DOSE (1)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
