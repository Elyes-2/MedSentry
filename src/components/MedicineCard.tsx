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

    // Status Colors
    let statusColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    let borderColor = "border-transparent";

    if (percentage < 25) {
        statusColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
        borderColor = "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]";
    } else if (percentage < 50) {
        statusColor = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    }

    return (
        <div className={`glass-panel p-6 relative group transition-all duration-300 hover:scale-[1.02] border ${borderColor} dark:border-opacity-100`}>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                        {medicine.name}
                    </h3>
                    <div className="flex gap-2 mt-2 text-xs font-mono tracking-wider uppercase">
                        {medicine.morning_dose > 0 && <span className="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-1 rounded">Morning: {medicine.morning_dose}</span>}
                        {medicine.lunch_dose > 0 && <span className="bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 px-2 py-1 rounded">Noon: {medicine.lunch_dose}</span>}
                        {medicine.night_dose > 0 && <span className="bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 px-2 py-1 rounded">Night: {medicine.night_dose}</span>}
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
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${statusColor}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Prediction Data */}
            <div className="bg-[var(--bg-input)] dark:bg-black/40 rounded-xl p-4 mb-6 border border-[var(--border-color)] relative overflow-hidden shadow-inner dark:shadow-none">
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
                            <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
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
                        <button onClick={(e) => handleTakeDose(e, medicine.morning_dose)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:hover:bg-blue-500 dark:text-blue-300 dark:hover:text-white rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all p-1" title={`Take Morning Dose (${medicine.morning_dose})`}>
                            <Sun size={12} /> AM
                        </button>
                    )}
                    {medicine.lunch_dose > 0 && (
                        <button onClick={(e) => handleTakeDose(e, medicine.lunch_dose)} className="bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-500/20 dark:hover:bg-orange-500 dark:text-orange-300 dark:hover:text-white rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all p-1" title={`Take Lunch Dose (${medicine.lunch_dose})`}>
                            <Sun size={12} /> NOON
                        </button>
                    )}
                    {medicine.night_dose > 0 && (
                        <button onClick={(e) => handleTakeDose(e, medicine.night_dose)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-500/20 dark:hover:bg-purple-500 dark:text-purple-300 dark:hover:text-white rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all p-1" title={`Take Night Dose (${medicine.night_dose})`}>
                            <Droplet size={12} /> PM
                        </button>
                    )}
                    {/* Fallback if no specific dose set */}
                    {medicine.morning_dose === 0 && medicine.lunch_dose === 0 && medicine.night_dose === 0 && (
                        <button
                            onClick={(e) => handleTakeDose(e, 1)}
                            className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700 dark:bg-cyan-500/20 dark:hover:bg-cyan-500 dark:text-cyan-300 dark:hover:text-white rounded-lg flex items-center justify-center col-span-3 transition-all"
                        >
                            <Droplet size={14} className="mr-1" /> DOSE (1)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
