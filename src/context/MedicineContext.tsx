import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Medication } from '../types';
import * as api from '../api/meds';

interface MedicineContextType {
    medicines: Medication[];
    addMedicine: (med: Omit<Medication, 'id'>) => void;
    updateMedicine: (id: number, updates: Partial<Medication>) => void;
    deleteMedicine: (id: number) => void;
    restockMedicine: (id: number) => void;
    takeDose: (id: number, amount: number) => void;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export function MedicineProvider({ children }: { children: React.ReactNode }) {
    const [medicines, setMedicines] = useState<Medication[]>([]);

    const refreshMeds = async () => {
        const meds = await api.getMedications();
        setMedicines(meds);
    };

    useEffect(() => {
        refreshMeds();
    }, []);

    const addMedicine = async (medData: Omit<Medication, 'id'>) => {
        await api.addMedication(medData as Medication);
        refreshMeds();
    };

    const updateMedicine = async (id: number, updates: Partial<Medication>) => {
        await api.updateMedication(id, updates);
        refreshMeds();
    };

    const deleteMedicine = async (id: number) => {
        await api.deleteMedication(id);
        refreshMeds();
    };

    const restockMedicine = async (id: number) => {
        await api.refillMedication(id);
        refreshMeds();
    };

    const takeDose = async (id: number, amount: number) => {
        const current = medicines.find(m => m.id === id);
        if (current) {
            const newStock = Math.max(0, current.total_stock - amount);
            await api.updateMedication(id, { total_stock: newStock });
            refreshMeds();
        }
    };

    return (
        <MedicineContext.Provider value={{ medicines, addMedicine, updateMedicine, deleteMedicine, restockMedicine, takeDose }}>
            {children}
        </MedicineContext.Provider>
    );
}

export function useMedicine() {
    const context = useContext(MedicineContext);
    if (context === undefined) {
        throw new Error('useMedicine must be used within a MedicineProvider');
    }
    return context;
}
