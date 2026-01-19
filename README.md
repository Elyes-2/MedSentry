# MedSentry

**MedSentry** is a modern, Electron-based desktop application designed to help users track their medication inventory and adhere to their prescribed dosage schedules. Built with a focus on user experience, it combines a premium aesthetic with smart tracking features.

## Features

- **Inventory Management**: Keep track of your medicine stock levels in real-time.
- **Smart Tracking**: Automated depletion logic to ensure stock counts are always accurate.
- **Email Alerts**: Receive automated email notifications when stock runs low (powered by Resend).
- **Premium UI**: specific design with a sleek dark mode, neon accents, and glassmorphism effects.
- **Desktop Experience**: Native desktop application performance and integration using Electron.

## Tech Stack

- **Core**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Email Service**: [Resend](https://resend.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## Getting Started

### Prerequisites

Ensure you have Node.js installed on your system.

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Set up your environment variables:
    - Create a `.env` file in the root directory.
    - Add necessary keys (e.g., `RESEND_API_KEY`).

### Development

To run the application in development mode:

```bash
npm run dev
```

### Build

To build the application for production:

```bash
npm run build
```
