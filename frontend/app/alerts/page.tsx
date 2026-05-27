import DashboardLayout from "@/components/layout/DashboardLayout";

/**
 * AlertsPage Component
 * 
 * Group Project Documentation:
 * Refactored layout colors to use semantic theme properties:
 * 1. Alerts card containers swapped from static `bg-zinc-900 border-zinc-800` to `bg-card border-border-custom shadow-premium`.
 * 2. Header and Patient titles mapped to `text-text-primary`.
 * 3. Alert description text and page subtitle mapped to `text-text-muted` (and secondary metadata to `text-text-secondary`).
 * 4. Severity badges stylized with soft background tints and high-contrast text in light mode:
 *    - High: `text-red-700 bg-red-50 dark:bg-red-500/20 dark:text-red-400`
 *    - Medium/Default: `text-amber-700 bg-amber-50 dark:bg-yellow-500/20 dark:text-yellow-300`
 */

const alerts = [
  {
    id: 1,
    patient: "Ayesha Rahman",
    message: "Critical blood pressure detected",
    severity: "High",
  },
  {
    id: 2,
    patient: "Fatema Noor",
    message: "Hemoglobin level dropping",
    severity: "Medium",
  },
];

export default function AlertsPage() {
  return (
    <DashboardLayout>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
          Emergency Alerts
        </h1>

        <p className="text-text-muted mt-1 transition-colors duration-300">
          AI-detected maternal health risks
        </p>
      </div>

      <div className="space-y-5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="
              bg-card
              border border-border-custom
              rounded-2xl
              p-6
              shadow-premium
              transition-all
              duration-300
            "
          >
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-text-primary transition-colors duration-300">
                  {alert.patient}
                </h2>

                <p className="text-text-muted mt-2 transition-colors duration-300">
                  {alert.message}
                </p>
              </div>

              <span
                className={`
                  px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                  ${
                    alert.severity === "High"
                      ? "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                      : "bg-amber-50 text-amber-700 dark:bg-yellow-500/20 dark:text-yellow-300"
                  }
                `}
              >
                {alert.severity}
              </span>

            </div>
          </div>
        ))}
      </div>

    </DashboardLayout>
  );
}