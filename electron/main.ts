import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import db from './db'
import { Resend } from 'resend'
import dotenv from 'dotenv'

// Load environment variables immediately
dotenv.config()

console.log('[DEBUG] ENV LOADED. RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
console.log('[DEBUG] ENV LOADED. EMAIL_RECEIVER:', process.env.EMAIL_RECEIVER)

const resend = new Resend(process.env.RESEND_API_KEY);

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

const VITE_PUBLIC = process.env.VITE_PUBLIC as string
const DIST = process.env.DIST as string

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(VITE_PUBLIC, 'vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,
    })

    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(DIST, 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// IPC Handlers
ipcMain.handle('medications:get-all', () => {
    return db.getAllMedications();
});

ipcMain.handle('medications:add', (_, med) => {
    return db.addMedication(med);
});

ipcMain.handle('medications:update', (_, { id, updates }) => {
    return db.updateMedication(id, updates);
});

ipcMain.handle('medications:delete', (_, id) => {
    return db.deleteMedication(id);
});

ipcMain.handle('medications:refill', (_, id) => {
    const med = db.getMedication(id);
    if (med) {
        db.updateMedication(id, { total_stock: med.total_stock + med.package_size });
    }
    return true;
});

ipcMain.handle('medications:trigger-test-alert', async () => {
    console.log('User manually triggered alert test.');
    try {
        const result = await checkDailyTasks(true);
        return { success: true, alerted: result.alerted };
    } catch (error) {
        console.error('Manual alert test failed:', error);
        throw error;
    }
});

// Helper to get all meds for email
async function sendEmailAlert(criticalMeds: any[], allMeds: any[]) {
    const receiver = process.env.EMAIL_RECEIVER;
    const apiKey = process.env.RESEND_API_KEY;

    // Sort: Critical first, then by lowest stock
    const sortedMeds = [...allMeds].sort((a, b) => {
        const aCrit = criticalMeds.some(c => c.name === a.name);
        const bCrit = criticalMeds.some(c => c.name === b.name);
        if (aCrit && !bCrit) return -1;
        if (!aCrit && bCrit) return 1;
        return a.total_stock - b.total_stock;
    });

    if (!apiKey || !receiver) {
        console.error('[EMAIL ERROR] Missing credentials. API_KEY:', !!apiKey, 'RECEIVER:', receiver);
        return;
    }

    console.log(`[EMAIL] Sending detailed report to: ${receiver}`);

    const criticalHtml = criticalMeds.map(med => {
        const dailyDose = med.morning_dose + med.lunch_dose + med.night_dose;
        const daysLeft = dailyDose > 0 ? Math.floor(med.total_stock / dailyDose) : '∞';

        return `
        <tr style="background-color: #fee2e2;">
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: #b91c1c;">${med.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #b91c1c;">${med.total_stock} / ${med.alert_threshold}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #b91c1c; font-weight: bold;">${daysLeft} days</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #b91c1c;">CRITICAL</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${(med.price_cents / 100).toFixed(2)}</td>
        </tr>
    `}).join('');

    const otherHtml = allMeds
        .filter(m => !criticalMeds.some(c => c.name === m.name))
        .map(med => {
            const dailyDose = med.morning_dose + med.lunch_dose + med.night_dose;
            const daysLeft = dailyDose > 0 ? Math.floor(med.total_stock / dailyDose) : '∞';

            return `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${med.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${med.total_stock}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${daysLeft} days</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #15803d;">OK</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${(med.price_cents / 100).toFixed(2)}</td>
        </tr>
    `}).join('');

    const timeStamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    try {
        const { data, error } = await resend.emails.send({
            from: 'MedSentry <onboarding@resend.dev>',
            to: [receiver],
            subject: `MedSentry [${timeStamp}] - ${criticalMeds.length > 0 ? '⚠️ Low Stock Alert' : 'Daily Report'}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 20px; border-radius: 12px 12px 0 0; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Daily Medicine Report</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    
                    <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                        ${criticalMeds.length > 0 ? `
                        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <strong style="color: #991b1b; font-size: 16px;">⚠️ Warning: Low Stock Detected</strong>
                            <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px;">The following items are below your alert threshold ($Days Notice).</p>
                        </div>` : ''}

                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background-color: #f3f4f6; text-align: left;">
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">Medicine</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">Stock</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">Days Left</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">Status</th>
                                    <th style="padding: 10px; border-bottom: 2px solid #ddd;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${criticalHtml}
                                ${otherHtml}
                            </tbody>
                        </table>

                        <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
                            Automated report generated by MedSentry.
                        </p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('[EMAIL ERROR] Resend:', error);
        } else {
            console.log('[EMAIL SUCCESS] Sent ID:', data?.id);
        }
    } catch (error) {
        console.error('[EMAIL EXCEPTION]', error);
    }
}

// Daily Task Runner
// Daily Task Runner
const checkDailyTasks = async (manualRun = false) => {
    const today = new Date().toISOString().split('T')[0];
    const lastRun = db.getLastRunDate();

    // If manual run, we skip the "already ran" check
    if (!manualRun && lastRun === today) {
        console.log('Daily tasks already ran for today.');
        return { alerted: [], deducted: false };
    }

    console.log(`Running daily tasks via ${manualRun ? 'MANUAL FORCE' : 'SCHEDULE'}`);

    const meds = await db.getAllMedications();
    const alerts: string[] = [];
    const lowStockMeds: any[] = [];
    let deductedAny = false;

    // First pass: Deduct stock
    for (const med of meds) {
        let newStock = med.total_stock;

        // DEDUCTION LOGIC: Only if NOT manual run
        if (!manualRun) {
            const dailyConsumption = med.morning_dose + med.lunch_dose + med.night_dose;
            if (dailyConsumption > 0 && med.total_stock > 0) {
                newStock = Math.max(0, med.total_stock - dailyConsumption);
                if (newStock !== med.total_stock) {
                    await db.updateMedication(med.id, { total_stock: newStock });
                    console.log(`Deducted daily dose for ${med.name}. New stock: ${newStock}`);
                    deductedAny = true;
                    // Update the local object so email/alert check is accurate
                    med.total_stock = newStock;
                }
            }
        }
    }

    // Second pass: Check alerts (using updated stock from object)
    for (const med of meds) {
        if (med.total_stock <= med.alert_threshold) {
            alerts.push(med.name);
            lowStockMeds.push(med);
        }
    }

    if (!manualRun) {
        db.setLastRunDate(today);
    }


    // Send Email if alerts exist OR manual test requesting full report
    if (alerts.length > 0 || manualRun) {
        await sendEmailAlert(lowStockMeds, meds);
    }

    return { alerted: alerts, deducted: deductedAny };
};

app.whenReady().then(() => {
    createWindow();

    // Run daily tasks on startup
    checkDailyTasks();

    // Check every hour if day changed
    setInterval(checkDailyTasks, 60 * 60 * 1000);
});
