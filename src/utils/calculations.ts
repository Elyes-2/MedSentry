import { addDays, isBefore, addHours } from 'date-fns';
import type { Medication } from '../types';

export type Prediction = {
    depletionDate: Date;
    lastDoseTime: 'Morning' | 'Noon' | 'Night';
    daysLeft: number;
    warning48h: boolean;
    restockDate: Date;
};

export function predictDepletion(med: Medication): Prediction {
    let currentStock = med.total_stock;
    let simulatedDate = new Date();
    let lastTime: 'Morning' | 'Noon' | 'Night' = 'Night';
    let daysCounter = 0;

    const dailyTotal = med.morning_dose + med.lunch_dose + med.night_dose;
    if (dailyTotal === 0) return createPrediction(new Date(), 'Night', 0); // No usage

    while (currentStock > 0) {
        // Morning
        if (med.morning_dose > 0) {
            if (currentStock >= med.morning_dose) {
                currentStock -= med.morning_dose;
                lastTime = 'Morning';
            } else {
                return createPrediction(simulatedDate, 'Morning', daysCounter);
            }
        }

        // Noon
        if (med.lunch_dose > 0) {
            if (currentStock >= med.lunch_dose) {
                currentStock -= med.lunch_dose;
                lastTime = 'Noon';
            } else {
                return createPrediction(simulatedDate, 'Noon', daysCounter);
            }
        }

        // Night
        if (med.night_dose > 0) {
            if (currentStock >= med.night_dose) {
                currentStock -= med.night_dose;
                lastTime = 'Night';
            } else {
                return createPrediction(simulatedDate, 'Night', daysCounter);
            }
        }

        simulatedDate = addDays(simulatedDate, 1);
        daysCounter++;

        if (daysCounter > 3650) break; // Safety
    }

    return createPrediction(addDays(new Date(), daysCounter - 1), lastTime, daysCounter);
}

function createPrediction(date: Date, time: 'Morning' | 'Noon' | 'Night', daysFromNow: number): Prediction {
    const timeOffsets = { 'Morning': 8, 'Noon': 13, 'Night': 21 };
    const exactDate = new Date(date);
    exactDate.setHours(timeOffsets[time], 0, 0, 0);

    const restockDate = addHours(exactDate, -48);
    const now = new Date();
    const warning48h = isBefore(restockDate, now);

    return {
        depletionDate: exactDate,
        lastDoseTime: time,
        daysLeft: daysFromNow,
        warning48h,
        restockDate
    };
}
