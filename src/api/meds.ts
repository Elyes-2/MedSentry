import type { Medication } from '../types';

export const getMedications = async (): Promise<Medication[]> => {
    return window.ipcRenderer.invoke('medications:get-all');
};

export const addMedication = async (med: Medication): Promise<void> => {
    return window.ipcRenderer.invoke('medications:add', med);
};

export const updateMedication = async (id: number, updates: Partial<Medication>): Promise<void> => {
    return window.ipcRenderer.invoke('medications:update', { id, updates });
};

export const deleteMedication = async (id: number): Promise<void> => {
    return window.ipcRenderer.invoke('medications:delete', id);
};

export const refillMedication = async (id: number): Promise<void> => {
    return window.ipcRenderer.invoke('medications:refill', id);
};
