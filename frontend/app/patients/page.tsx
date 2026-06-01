import DashboardLayout from "@/components/layout/DashboardLayout";

const patients = [
  {
    id: 1,
    name: "LocalPDF Studio",
    village: "No Donation Village",
    risk: "High",
    trimester: 3,
    initials: "LS",
  },
  {
    id: 2,
    name: "Rafid",
    village: "Fucking Village where Rafid is fucked everytime!",
    risk: "High",
    trimester: 2,
    initials: "RF",
  },
  {
    id: 3,
    name: "Nusrat Jahan",
    village: "Sylhet",
    risk: "Low",
    trimester: 1,
    initials: "NJ",
  },
];

const trimesterLabel = (t: number) => {
  if (t === 1) return "1st Trimester";
  if (t === 2) return "2nd Trimester";
  return "3rd Trimester";
};

const riskConfig = (risk: string) => {
  if (risk === "High")
    return {
      badge: "bg-[#2a0e0e] text-[#f06060] border border-[#5a1a1a]",
      dot: "bg-[#f06060]",
    };
  if (risk === "Medium")
    return {
      badge: "bg-[#2a1e06] text-[#e0a040] border border-[#5a3a10]",
      dot: "bg-[#e0a040]",
    };
  return {
    badge: "bg-[#0a2010] text-[#40c070] border border-[#1a5030]",
    dot: "bg-[#40c070]",
  };
};

export default function PatientsPage() {
  return (
    <DashboardLayout>

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-1">
            Maternal Health AI
          </p>
          <h1 className="text-[26px] font-semibold text-[#f0f2f6] leading-tight">
            Patients
          </h1>
          <p className="text-[13px] text-[#5a6478] mt-1">
            Maternal healthcare monitoring
          </p>
        </div>

        <button className="
          flex items-center gap-2
          bg-[#1a4fa8] hover:bg-[#2060c8] active:scale-95
          text-[#d8e8ff] text-[13px] font-semibold tracking-wide
          px-5 py-2.5 rounded-xl transition-all duration-200
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Patient
        </button>
      </div>

      {/* ── Patients Table ── */}
      <div className="bg-[#131720] border border-[#1e2535] rounded-2xl overflow-hidden mb-8">

        {/* Section label */}
        <div className="px-6 py-4 border-b border-[#1e2535] flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            All Patients
          </p>
          <span className="px-2.5 py-0.5 rounded-full bg-[#0f1f32] border border-[#1e3350] text-[#4a6fa0] text-[11px] font-bold font-mono">
            {patients.length}
          </span>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-[#0d1118]">
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">
                Patient
              </th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">
                Village
              </th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">
                Trimester
              </th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">
                Risk Level
              </th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient, index) => {
              const config = riskConfig(patient.risk);
              return (
                <tr
                  key={patient.id}
                  className={`border-t border-[#1a2235] transition-colors duration-150 hover:bg-[#0f1520] ${
                    index % 2 === 0 ? "bg-[#0d1118]" : "bg-[#0b0f16]"
                  }`}
                >
                  {/* Patient */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-[#0a0d14] border border-[#1a2235] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#4a7fa8] font-mono tracking-wider">
                            {patient.initials}
                          </span>
                        </div>
                        <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${config.dot} ring-2 ring-[#0d1118]`} />
                      </div>
                      <span className="text-[14px] font-semibold text-[#dce4f0]">
                        {patient.name}
                      </span>
                    </div>
                  </td>

                  {/* Village */}
                  <td className="px-6 py-4">
                    <span className="text-[13px] text-[#5a6a84] max-w-50 truncate block">
                      {patient.village}
                    </span>
                  </td>

                  {/* Trimester */}
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-mono font-semibold px-3 py-1 rounded-full bg-[#0f1f32] border border-[#1e3350] text-[#4a6fa0] tracking-wider">
                      {trimesterLabel(patient.trimester)}
                    </span>
                  </td>

                  {/* Risk */}
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full ${config.badge}`}>
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