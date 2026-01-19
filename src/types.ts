export interface Medication {
    id?: number;
    name: string;
    total_stock: number;
    morning_dose: number;
    lunch_dose: number;
    night_dose: number;
    alert_threshold: number;
    price_cents: number;
    package_size: number;
}
