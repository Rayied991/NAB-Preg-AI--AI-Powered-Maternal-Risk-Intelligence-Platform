import DashboardLayout from "@/components/layout/DashboardLayout";

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
        <h1 className="text-3xl font-bold text-white">
          Emergency Alerts
        </h1>

        <p className="text-zinc-400 mt-1">
          AI-detected maternal health risks
        </p>
      </div>

      <div className="space-y-5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="
              bg-zinc-900
              border border-zinc-800
              rounded-2xl
              p-6
            "
          >
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-white">
                  {alert.patient}
                </h2>

                <p className="text-zinc-400 mt-2">
                  {alert.message}
                </p>
              </div>

              <span
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  ${
                    alert.severity === "High"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-300"
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