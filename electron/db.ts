import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'medsmanager_storage.json');

export interface MedicationDB {
  id: number;
  name: string;
  total_stock: number;
  morning_dose: number;
  lunch_dose: number;
  night_dose: number;
  alert_threshold: number;
  price_cents: number;
  package_size: number;
}

export interface AppState {
  lastRunStr: string;
}

interface DBData {
  medications: MedicationDB[];
  appState: AppState;
}

class JsonDB {
  private data: DBData;

  constructor() {
    this.data = this.load();
  }

  private load(): DBData {
    try {
      if (fs.existsSync(dbPath)) {
        const fileData = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(fileData);
      }
    } catch (error) {
      console.error('Failed to load DB:', error);
    }
    return { medications: [], appState: { lastRunStr: '' } };
  }

  private save() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Failed to save DB:', error);
    }
  }

  // Mediations API
  getAllMedications(): MedicationDB[] {
    return this.data.medications;
  }

  addMedication(med: Omit<MedicationDB, 'id'>) {
    const newId = this.data.medications.length > 0
      ? Math.max(...this.data.medications.map(m => m.id)) + 1
      : 1;
    const newMed = { ...med, id: newId };
    this.data.medications.push(newMed);
    this.save();
    return newMed;
  }

  updateMedication(id: number, updates: Partial<MedicationDB>) {
    const index = this.data.medications.findIndex(m => m.id === id);
    if (index !== -1) {
      this.data.medications[index] = { ...this.data.medications[index], ...updates };
      this.save();
    }
  }

  deleteMedication(id: number) {
    this.data.medications = this.data.medications.filter(m => m.id !== id);
    this.save();
  }

  getMedication(id: number) {
    return this.data.medications.find(m => m.id === id);
  }

  // App State API
  getLastRunDate(): string {
    return this.data.appState.lastRunStr;
  }

  setLastRunDate(dateStr: string) {
    this.data.appState.lastRunStr = dateStr;
    this.save();
  }
}

const db = new JsonDB();
export default db;
