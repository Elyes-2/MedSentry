import React, { useState, useEffect } from 'react';
import { Plus, Minus, Pill, Sun, Moon, DollarSign, Bell, Save } from 'lucide-react';
import { useMedicine } from '../context/MedicineContext';
import type { Medication } from '../types';

interface MedicineFormProps {
    onClose?: () => void;
    initialData?: Medication | null;
}

export function MedicineForm({ onClose, initialData }: MedicineFormProps) {
    const { addMedicine, updateMedicine } = useMedicine();
    const [name, setName] = useState('');
    const [packageSize, setPackageSize] = useState('');
    const [currentStock, setCurrentStock] = useState('');
    const [price, setPrice] = useState('');
    const [alertDays, setAlertDays] = useState('5'); // Default 5 days notice

    const [morning, setMorning] = useState('0');
    const [lunch, setLunch] = useState('0');
    const [night, setNight] = useState('0');

    const [isOpen, setIsOpen] = useState(false);

    // Load initial data if editing
    useEffect(() => {
        if (initialData) {
            setIsOpen(true);
            setName(initialData.name);
            setPackageSize(initialData.package_size.toString());
            setCurrentStock(initialData.total_stock.toString());
            setPrice((initialData.price_cents / 100).toFixed(2));
            setMorning(initialData.morning_dose.toString());
            setLunch(initialData.lunch_dose.toString());
            setNight(initialData.night_dose.toString());

            // Convert Qty -> Days logic
            const dailyDose = initialData.morning_dose + initialData.lunch_dose + initialData.night_dose;
            if (dailyDose > 0) {
                setAlertDays(Math.ceil(initialData.alert_threshold / dailyDose).toString());
            } else {
                setAlertDays('5'); // Default fallback
            }
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !packageSize) return;

        const m = parseInt(morning) || 0;
        const l = parseInt(lunch) || 0;
        const n = parseInt(night) || 0;
        const dailyTotal = m + l + n;

        // Calculate threshold based on days: Days * DailyTotal
        // If daily total is 0, default to 10 pills just in case
        const days = parseInt(alertDays) || 0;
        const calculatedThreshold = dailyTotal > 0 ? (days * dailyTotal) : 10;

        const medData = {
            name,
            package_size: parseInt(packageSize),
            total_stock: currentStock ? parseInt(currentStock) : parseInt(packageSize),
            price_cents: price ? Math.round(parseFloat(price) * 100) : 0,
            alert_threshold: calculatedThreshold,
            morning_dose: m,
            lunch_dose: l,
            night_dose: n,
        };

        if (initialData && initialData.id) {
            updateMedicine(initialData.id, medData);
        } else {
            addMedicine(medData);
        }

        handleClose();
    };

    const handleClose = () => {
        setName('');
        setPackageSize('');
        setCurrentStock('');
        setPrice('');
        setAlertDays('5');
        setMorning('0');
        setLunch('0');
        setNight('0');
        setIsOpen(false);
        if (onClose) onClose();
    };

    const CounterInput = ({
        value,
        onChange,
        label,
        icon: Icon,
        colorClass = "text-gray-500",
        min = 0
    }: {
        value: string,
        onChange: (v: string) => void,
        label: string,
        icon?: any,
        colorClass?: string,
        min?: number
    }) => {
        const val = parseInt(value) || 0;
        return (
            <div className="flex flex-col gap-1">
                <label className={`block text-[10px] uppercase tracking-tighter mb-1 font-bold flex items-center gap-1 ${colorClass}`}>
                    {Icon && <Icon size={10} />} {label}
                </label>
                <div className="flex items-center rounded-xl border border-[var(--border-color)] p-1.5 transition-all shadow-sm" style={{ background: 'var(--input-bg)' }}>
                    <button
                        type="button"
                        onClick={() => onChange(Math.max(min, val - 1).toString())}
                        className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all"
                        style={{ background: 'var(--input-btn)' }}
                    >
                        <Minus size={16} />
                    </button>
                    <input
                        type="number"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="bg-transparent border-none text-center w-full focus:ring-0 text-[var(--text-primary)] font-mono text-xl font-bold p-0"
                        min={min}
                    />
                    <button
                        type="button"
                        onClick={() => onChange((val + 1).toString())}
                        className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all"
                        style={{ background: 'var(--input-btn)' }}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        );
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full h-40 glass-panel flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)] hover:text-cyan-500 transition-all group border-dashed hover:border-solid hover:scale-[1.02]"
                style={{ borderWidth: '2px', borderColor: 'var(--border-color)' }}
            >
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-input)] dark:bg-white/5 group-hover:bg-cyan-500/10 flex items-center justify-center transition-all group-hover:rotate-90">
                    <Plus size={32} className="text-[var(--text-secondary)] group-hover:text-cyan-500 transition-colors" />
                </div>
                <div className="text-center">
                    <span className="block font-bold tracking-[0.2em] text-[10px] uppercase opacity-60 group-hover:opacity-100" style={{ fontFamily: 'Outfit, sans-serif' }}>Initialize New</span>
                    <span className="block text-xl font-bold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'Outfit, sans-serif' }}>Prescription</span>
                </div>
            </button>
        )
    }

    return (
        <div className="glass-panel p-6 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)] mb-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 neon-text-cyan text-[var(--text-primary)]">
                    {initialData ? <Save size={20} className="text-cyan-500" /> : <Pill className="text-cyan-500" />}
                    {initialData ? 'Edit Prescription' : 'New Prescription'}
                </h2>
                <button onClick={handleClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2 font-bold opacity-80">Medicine Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="input-premium focus:ring-2 focus:ring-cyan-500/50"
                            placeholder="e.g. Neuro-Stims"
                            autoFocus
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CounterInput
                        label="Package Size"
                        value={packageSize}
                        onChange={setPackageSize}
                        min={1}
                    />
                    <CounterInput
                        label="In Stock"
                        value={currentStock}
                        onChange={setCurrentStock}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1 font-bold flex items-center gap-1 opacity-80">
                            <DollarSign size={10} /> Price ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="input-premium py-2 text-sm"
                            placeholder="0.00"
                        />
                    </div>
                    <CounterInput
                        label="Alert Days"
                        value={alertDays}
                        onChange={setAlertDays}
                        icon={Bell}
                    />
                </div>

                <div className="border-t border-[var(--border-color)] pt-6 mt-2">
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-6 font-bold text-center opacity-80" style={{ fontFamily: 'Outfit, sans-serif' }}>Dosage Schedule</label>
                    <div className="grid grid-cols-3 gap-3">
                        <CounterInput
                            label="Morning"
                            value={morning}
                            onChange={setMorning}
                            icon={Sun}
                            colorClass="text-blue-400"
                        />
                        <CounterInput
                            label="Noon"
                            value={lunch}
                            onChange={setLunch}
                            icon={Sun}
                            colorClass="text-orange-400"
                        />
                        <CounterInput
                            label="Night"
                            value={night}
                            onChange={setNight}
                            icon={Moon}
                            colorClass="text-purple-400"
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full py-4 mt-2 text-lg tracking-widest uppercase flex justify-center items-center gap-3">
                    {initialData ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {initialData ? 'Save Changes' : 'Initialize Tracker'}
                </button>
            </form>
        </div>
    );
}
