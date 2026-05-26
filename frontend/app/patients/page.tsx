import DashboardLayout from "@/components/layout/DashboardLayout";

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
          <h1 className="text-3xl font-bold text-white">
            Patients
          </h1>

          <p className="text-zinc-400 mt-1">
            Maternal healthcare monitoring
          </p>
        </div>

        <button className="
          bg-blue-600 hover:bg-blue-700
          px-5 py-3 rounded-xl
          font-medium transition-all
        ">
          + Add Patient
        </button>
      </div>

      {/* Patients Table */}
      <div className="
        bg-zinc-900
        rounded-2xl
        border border-zinc-800
        overflow-hidden
      ">

        <table className="w-full">

          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="text-left p-4">Patient</th>
              <th className="text-left p-4">Village</th>
              <th className="text-left p-4">Trimester</th>
              <th className="text-left p-4">Risk Level</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="border-t border-zinc-800"
              >
                <td className="p-4 text-white">
                  {patient.name}
                </td>

                <td className="p-4 text-zinc-300">
                  {patient.village}
                </td>

                <td className="p-4 text-zinc-300">
                  {patient.trimester}
                </td>

                <td className="p-4">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${
                        patient.risk === "High"
                          ? "bg-red-500/20 text-red-400"
                          : patient.risk === "Medium"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-green-500/20 text-green-400"
                      }
                    `}
                  >
                    {patient.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </DashboardLayout>
  );
}