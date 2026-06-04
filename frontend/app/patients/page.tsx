/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getCopilotSummary } from "@/services/copilot.service";
import {
  createPatient,
} from "@/services/create-patient.service";
import { fetchPatientHistory } from "@/services/patient-history.service";
import { fetchPatients } from "@/services/patient.service";
import { getPatientTrends } from "@/services/trends.service";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// ── Helpers declared outside page component ───────────────────────────────────

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    HIGH:   "bg-red-500/15 text-red-400 border-red-500/30",
    MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    LOW:    "bg-green-500/15 text-green-400 border-green-500/30",
  };
  const cls = map[risk?.toUpperCase()] ?? "bg-[#1e2535] text-[#5a6478] border-[#1e2535]";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
      {risk ?? "—"}
    </span>
  );
}


function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    CRITICAL: "bg-red-600/20 text-red-300 border-red-600/40",
    HIGH:     "bg-red-500/15 text-red-400 border-red-500/30",
    MEDIUM:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    LOW:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  const cls = map[severity?.toUpperCase()] ?? "bg-[#1e2535] text-[#5a6478] border-[#1e2535]";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
      {severity ?? "—"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    RESOLVED: "bg-green-500/15 text-green-400 border-green-500/30",
    PENDING:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    ACTIVE:   "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const cls = map[status?.toUpperCase()] ?? "bg-[#1e2535] text-[#5a6478] border-[#1e2535]";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

function SectionCard({
  title,
  icon,
  count,
  empty,
  emptyLabel = "No records found",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  empty?: boolean;
  emptyLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-[#131720] border border-[#1e2535] rounded-2xl overflow-hidden">
      {/* card header */}
      <div className="px-6 py-4 border-b border-[#1e2535] flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] flex items-center gap-2">
          {icon}
          {title}
        </p>
        {count !== undefined && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#0f1f32] border border-[#1e3350] text-[#4a6fa0] text-[11px] font-bold font-mono">
            {count}
          </span>
        )}
      </div>
      {empty ? (
        <div className="px-6 py-10 text-center">
          <p className="text-[13px] text-[#2d3a50] italic">{emptyLabel}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#181f30] last:border-0">
      <span className="text-[12px] text-[#3a4a68] w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-[13px] text-[#c8d0e0] font-medium">{value ?? "—"}</span>
    </div>
  );
}

function formatOcrValue(val: any): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.systolic && val.diastolic) return `${val.systolic}/${val.diastolic} ${val.unit || ''}`.trim();
    if (val.sys && val.dia) return `${val.sys}/${val.dia} ${val.unit || ''}`.trim();
    if (val.value) return `${val.value} ${val.unit || ''}`.trim();
    return JSON.stringify(val);
  }
  return "—";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [history, setHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [creating, setCreating] =
  useState(false);
  const [trends, setTrends] = useState<any>(null);

  const [showModal, setShowModal] =
  useState(false);
  const [copilotSummary, setCopilotSummary] =
  useState<string>("");

  const [loadingSummary, setLoadingSummary] =
  useState(false);

const [form, setForm] = useState({
  patient_code: "",
  full_name: "",
  age: 0,
  trimester: 1,
  pregnancy_week: 1,
  village: "",
  blood_group: "",
  contact_number: "",
  emergency_contact: "",
  height_cm: 0.0
});

const handleGenerateSummary = async (
  patientId: string
) => {
  try {
    setLoadingSummary(true);

    const result =
      await getCopilotSummary(
        patientId
      );

    setCopilotSummary(
      result.summary
    );
  } catch (error) {
    console.error(error);
  } finally {
    setLoadingSummary(false);
  }
};

const handleCreatePatient =
  async () => {
    if (
  !form.patient_code ||
  !form.full_name ||
  !form.village
) {
  alert(
    "Please fill all required fields"
  );
  return;
}

  setCreating(true);
    try {

      await createPatient(form);

      const updatedPatients =
        await fetchPatients();

      setPatients(updatedPatients);
      const createdPatient =
  updatedPatients.find(
    (p: any) =>
      p.patient_code === form.patient_code
  );

if (createdPatient) {
  setSelectedPatient(
    createdPatient.id
  );

  await loadHistory(
    createdPatient.id
  );
}

      setShowModal(false);
     setForm({
  patient_code: "",
  full_name: "",
  age: 0,
  trimester: 1,
  pregnancy_week: 1,
  village: "",
  blood_group: "",
  contact_number: "",
  emergency_contact: "",
  height_cm: 0,
});

    } catch (error) {
      console.error(error);
    }
    finally{
      setCreating(false);
    }
  };

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await fetchPatients();
        setPatients(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadPatients();
  }, []);

  const loadHistory = async (
  patientId: string
) => {
  setHistory(null);

  if (!patientId) return;

  setHistoryLoading(true);

  try {
    const [historyData, trendData] =
      await Promise.all([
        fetchPatientHistory(patientId),
        getPatientTrends(patientId),
      ]);

    setHistory(historyData);
    setTrends(trendData);

  } catch (err) {
    console.error(err);
  } finally {
    setHistoryLoading(false);
  }
};

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPatient(id);
    await loadHistory(id);
  };

  const handleRowClick = async (id: string) => {
    setSelectedPatient(id);
    await loadHistory(id);
  };

  return (
    <DashboardLayout>

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a7fa8] mb-1">
            Maternal Health AI
          </p>
          <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
            Patients
          </h1>
          <p className="text-text-muted mt-1 transition-colors duration-300">
            Maternal healthcare monitoring
          </p>
        </div>




    <button
  onClick={() => setShowModal(true)}
  className="flex items-center gap-2 bg-[#1a4fa8] hover:bg-[#2060c8] active:scale-95 text-[#d8e8ff] text-[13px] font-semibold tracking-wide px-5 py-2.5 rounded-xl transition-all duration-200"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>

  Add Patient
</button>

      </div>

      {/* ── Patients Table Card ── */}
      <SectionCard
        title="All Patients"
        count={patients.length}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        }
      >
        {/* Dropdown selector */}
        <div className="px-6 py-4 border-b border-[#1e2535]">
          <select
            value={selectedPatient}
            onChange={handleSelectChange}
            className="w-full sm:w-72 bg-[#0d1118] border border-[#1e2535] hover:border-[#2a3650] focus:border-[#1a4fa8] focus:outline-none text-[#c8d0e0] text-[13px] rounded-xl px-4 py-2 transition-all duration-200"
          >
            <option value="">Select a patient to view history</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.patient_code} — {p.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-[#0d1118]">
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">Patient</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">Village</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-[#2d3a50]">Patient Code</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr
                key={p.id}
                onClick={() => handleRowClick(p.id)}
                className={`border-t border-[#1a2235] cursor-pointer transition-colors duration-150
                  ${selectedPatient === p.id ? "bg-[#0f1f38]" : "hover:bg-[#0d1520]"}`}
              >
                <td className="px-6 py-4 text-[13px] text-[#c8d0e0] font-medium">{p.full_name}</td>
                <td className="px-6 py-4 text-[13px] text-[#5a6478]">{p.village}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded bg-[#0f1f32] border border-[#1e3350] text-[#4a7fa8] text-[11px] font-mono">
                    {p.patient_code}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* ── Loading state ── */}
      {historyLoading && (
        <div className="mt-6 bg-[#131720] border border-[#1e2535] rounded-2xl px-6 py-12 text-center">
          <p className="text-[13px] text-[#4a7fa8] animate-pulse">Loading patient history…</p>
        </div>
      )}

      {/* ── History: each section is its own card ── */}
      {history && (
        <div className="mt-6 flex flex-col gap-5">

          {/* Trends Details */}
          <SectionCard
            title="Patient Trends"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          >
          <div className="p-6">

              {trends?.error ? (

                <div className="h-72 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-red-400">
                      Unable to load patient trends
                    </p>
                    <p className="text-xs text-[#5a6478] mt-1">
                      Please try again later.
                    </p>
                  </div>
                </div>

              ) : !trends?.hemoglobin?.length ? (

                <div className="h-72 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-[#8b95a7]">
                      No trend data available
                    </p>
                    <p className="text-xs text-[#5a6478] mt-1">
                      Upload OCR reports to visualize patient trends.
                    </p>
                  </div>
                </div>

              ) : (

            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={trends.hemoglobin}
                >
                  <CartesianGrid stroke="#1e2535" />

                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#5a6478" }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Hemoglobin"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

          )}

        </div>
        </SectionCard>
          {/* ── Patient Details ── */}
          <SectionCard
            title="Patient Details"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            }
          >
            <div className="px-6 py-1">
              <MetaRow label="Full name"    value={history.patient.full_name} />
              <MetaRow label="Village"      value={history.patient.village} />
              <MetaRow label="Age"          value={history.patient.age ? `${history.patient.age} yrs` : undefined} />
              <MetaRow label="Patient code" value={
                <span className="px-2 py-0.5 rounded bg-[#0f1f32] border border-[#1e3350] text-[#4a7fa8] font-mono text-[11px]">
                  {history.patient.patient_code}
                </span>
              } />
            </div>

            <div className="px-6 pb-4 flex gap-3">
                  <button
                    onClick={() =>
                      window.open(
                        `http://127.0.0.1:8000/api/report/${history.patient.id}`
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                  >
                    Download Clinical Report
                  </button>

                  <button
                    onClick={() =>
                      handleGenerateSummary(
                        history.patient.id
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    {loadingSummary
                      ? "AI Analyzing Patient..."
                      : "Generate AI Summary"}
                  </button>
                </div>

                {copilotSummary && (
                  <div className="mx-6 mb-6 p-4 rounded-xl bg-[#0d1118] border border-[#1e2535]">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      AI Clinical Summary
                    </h3>

                    <pre className="whitespace-pre-wrap text-sm text-[#c8d0e0]">
                      {copilotSummary}
                    </pre>
                  </div>
                )}
          </SectionCard>

          {/* ── OCR Reports ── */}
          <SectionCard
            title="OCR Reports"
            count={history.ocr_reports.length}
            emptyLabel="No OCR reports found"
            empty={history.ocr_reports.length === 0}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            }
          >
            <div className="divide-y divide-[#1a2235]">
              {history.ocr_reports.map((report: any) => (
                <div key={report.id} className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[11px] text-[#3a4a68] mb-1.5">Hemoglobin</p>
                    <p className="text-[14px] font-semibold text-[#c8d0e0]">{formatOcrValue(report.parsed_json?.hemoglobin)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#3a4a68] mb-1.5">Blood pressure</p>
                    <p className="text-[14px] font-semibold text-[#c8d0e0]">{formatOcrValue(report.parsed_json?.blood_pressure)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#3a4a68] mb-1.5">Blood sugar</p>
                    <p className="text-[14px] font-semibold text-[#c8d0e0]">{formatOcrValue(report.parsed_json?.blood_sugar)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#3a4a68] mb-1.5">Uploaded</p>
                    <p className="text-[12px] text-[#5a6478]">{new Date(report.uploaded_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Predictions ── */}
          <SectionCard
            title="Predictions"
            count={history.predictions.length}
            emptyLabel="No predictions found"
            empty={history.predictions.length === 0}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            }
          >
            <div className="divide-y divide-[#1a2235]">
              {history.predictions.map((pred: any) => (
                <div key={pred.id} className="px-6 py-4 flex flex-wrap items-center gap-6">
                  <div className="min-w-27.5">
                    <p className="text-[11px] text-[#3a4a68] mb-1.5">Overall risk</p>
                    <RiskBadge risk={pred.overall_risk} />
                  </div>
                  <div className="min-w-27.5">
                    <p className="text-[11px] text-[#3a4a68] mb-1">Confidence</p>
                    <p className="text-[15px] font-semibold text-[#c8d0e0]">
                      {pred.confidence_score != null ? `${pred.confidence_score}%` : "—"}
                    </p>
                    {pred.confidence_score != null && (
                      <div className="mt-1.5 h-1 w-20 bg-[#1e2535] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1a4fa8] rounded-full transition-all duration-700" style={{ width: `${pred.confidence_score}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-27.5">
                    <p className="text-[11px] text-[#3a4a68] mb-1">Clinical score</p>
                    <p className="text-[15px] font-semibold text-[#c8d0e0]">{pred.clinical_score ?? "—"}</p>
                  </div>
                  <div className="min-w-35 ml-auto">
                    <p className="text-[11px] text-[#3a4a68] mb-1">Predicted at</p>
                    <p className="text-[12px] text-[#5a6478]">{new Date(pred.predicted_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Alerts ── */}
          <SectionCard
            title="Alerts"
            count={history.alerts.length}
            emptyLabel="No alerts found"
            empty={history.alerts.length === 0}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
          >
            <div className="divide-y divide-[#1a2235]">
              {history.alerts.map((alert: any) => (
                <div key={alert.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <SeverityBadge severity={alert.severity} />
                    <StatusBadge   status={alert.status} />
                  </div>
                  <p className="text-[13px] text-[#c8d0e0] leading-relaxed mb-2">
                    {alert.alert_message}
                  </p>
                  <p className="text-[12px] text-[#3a4a68]">
                    Triggered: {new Date(alert.triggered_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

        </div>
      )}

      {showModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-[#131720] border border-[#1e2535] rounded-2xl p-6 w-full max-w-lg">

      <h2 className="text-xl text-white font-semibold mb-4">
        Create Patient
      </h2>

      <div className="space-y-3">

       <input
  value={form.patient_code}
  placeholder="Patient Code"
  className="w-full p-3 rounded-lg bg-[#0d1118]"
  onChange={(e) =>
    setForm({
      ...form,
      patient_code: e.target.value,
    })
  }
/>

        <input
        value={form.full_name}
          placeholder="Full Name"
          className="w-full p-3 rounded-lg bg-[#0d1118]"
          onChange={(e) =>
            setForm({
              ...form,
              full_name: e.target.value,
            })
          }
        />
        <input
        value={form.age}
  type="number"
  placeholder="Age"
  className="w-full p-3 rounded-lg bg-[#0d1118]"
  onChange={(e) =>
    setForm({
      ...form,
      age: Number(e.target.value),
    })
  }
/>

<input
  type="number"
  value={form.trimester}
  placeholder="Trimester"
  className="w-full p-3 rounded-lg bg-[#0d1118]"
  onChange={(e) =>
    setForm({
      ...form,
      trimester: Number(e.target.value),
    })
  }
/>

<input
  type="number"
  value={form.pregnancy_week}
  placeholder="Pregnancy Week"
  className="w-full p-3 rounded-lg bg-[#0d1118]"
  onChange={(e) =>
    setForm({
      ...form,
      pregnancy_week: Number(e.target.value),
    })
  }
/>

        <input
        value={form.village}
          placeholder="Village"
          className="w-full p-3 rounded-lg bg-[#0d1118]"
          onChange={(e) =>
            setForm({
              ...form,
              village: e.target.value,
            })
          }
        />

        <input
        value={form.blood_group}
          placeholder="Blood Group"
          className="w-full p-3 rounded-lg bg-[#0d1118]"
          onChange={(e) =>
            setForm({
              ...form,
              blood_group: e.target.value,
            })
          }
        />

        <input
        value={form.contact_number}
          placeholder="Phone Number"
          className="w-full p-3 rounded-lg bg-[#0d1118]"
          onChange={(e) =>
            setForm({
              ...form,
              contact_number:
                e.target.value,
            })
          }
        />

        <input
  value={form.emergency_contact}
  placeholder="Emergency Contact"
  className="w-full p-3 rounded-lg bg-[#0d1118]"
  onChange={(e) =>
    setForm({
      ...form,
      emergency_contact: e.target.value,
    })
  }
/>

<input
  type="number"
  value={form.height_cm}
  placeholder="Height (cm)"
  className="w-full p-3 rounded-lg bg-[#0d1118]"
  onChange={(e) =>
    setForm({
      ...form,
      height_cm: Number(e.target.value),
    })
  }
/>

      </div>

      <div className="flex gap-3 mt-6">

        <button
  onClick={() => {
    setShowModal(false);

    setForm({
  patient_code: "",
  full_name: "",
  age: 0,
  trimester: 1,
  pregnancy_week: 1,
  village: "",
  blood_group: "",
  contact_number: "",
  emergency_contact: "",
  height_cm: 0,
});
  }}
  className="px-4 py-2 rounded-lg bg-zinc-700"
>
  Cancel
</button>

       <button
          onClick={handleCreatePatient}
          disabled={creating}
          className="
            px-4 py-2
            rounded-lg
            bg-blue-600
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {creating
            ? "Creating..."
            : "Create"}
        </button>

        

      </div>

      

    </div>

  </div>
)}

    </DashboardLayout>
  );
}