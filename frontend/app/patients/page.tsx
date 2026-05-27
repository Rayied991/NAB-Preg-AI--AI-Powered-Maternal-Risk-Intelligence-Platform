import DashboardLayout from "@/components/layout/DashboardLayout";

/**
 * PatientsPage Component
 * 
 * Group Project Documentation:
 * 1. Swapped layout structures from zinc-900/950 to semantic `bg-card`, `bg-header-bg`, and `border-border-custom`.
 * 2. Explicitly added `text-white` to the "+ Add Patient" blue button so it retains legibility in light mode.
 * 3. Rewrote the risk badge class resolver:
 *    - Expanded the matching to check if the risk description starts with or contains 'high', 'medium', or 'low'.
 *    - Stylized the badges with soft background tints and high-contrast text in light mode, and transparent fallback glow in dark mode:
 *      - High: `text-red-700 bg-red-50 dark:bg-red-500/20 dark:text-red-400`
 *      - Medium: `text-amber-700 bg-amber-50 dark:bg-yellow-500/20 dark:text-yellow-300`
 *      - Low: `text-green-700 bg-green-50 dark:bg-green-500/20 dark:text-green-400`
 */

const patients = [
  {
    id: 1,
    name: "LocalPDF Studio",
    village: "No Donation Village",
    risk: "High risk of no donation",
    trimester: 3,
  },
  {
    id: 2,
    name: "Rafid",
    village: "Fucking Village where Rafid is fucked everytime!",
    risk: "High level features",
    trimester: 2,
  },
  {
    id: 3,
    name: "Nusrat Jahan",
    village: "Sylhet",
    risk: "Low",
    trimester: 1,
  },
];

export default function PatientsPage() {
  return (
    <DashboardLayout>

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
            Patients
          </h1>

          <p className="text-text-muted mt-1 transition-colors duration-300">
            Maternal healthcare monitoring
          </p>
        </div>

        <button className="
          bg-blue-600 hover:bg-blue-700
          text-white
          px-5 py-3 rounded-xl
          font-medium transition-all duration-300 cursor-pointer shadow-sm active:scale-95
        ">
          + Add Patient
        </button>
      </div>

      {/* Patients Table */}
      <div className="
        bg-card
        rounded-2xl
        border border-border-custom
        shadow-premium
        overflow-hidden
        transition-all
        duration-300
      ">

        <table className="w-full">

          <thead className="bg-header-bg text-text-muted border-b border-border-custom transition-colors duration-300">
            <tr>
              <th className="text-left p-4">Patient</th>
              <th className="text-left p-4">Village</th>
              <th className="text-left p-4">Trimester</th>
              <th className="text-left p-4">Risk Level</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => {
              const riskLower = patient.risk.toLowerCase();
              const isHigh = riskLower.includes("high");
              const isMedium = riskLower.includes("medium");

              return (
                <tr
                  key={patient.id}
                  className="border-t border-border-custom transition-colors duration-300"
                >
                  <td className="p-4 text-text-primary font-medium transition-colors duration-300">
                    {patient.name}
                  </td>

                  <td className="p-4 text-text-secondary transition-colors duration-300">
                    {patient.village}
                  </td>

                  <td className="p-4 text-text-secondary transition-colors duration-300">
                    {patient.trimester}
                  </td>

                  <td className="p-4">
                    <span
                      className={`
                        px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300
                        ${
                          isHigh
                            ? "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                            : isMedium
                            ? "bg-amber-50 text-amber-700 dark:bg-yellow-500/20 dark:text-yellow-300"
                            : "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                        }
                      `}
                    >
                      {patient.risk}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

    </DashboardLayout>
  );
}