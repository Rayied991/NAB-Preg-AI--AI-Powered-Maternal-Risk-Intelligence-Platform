/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import RiskProgressionCard from "@/components/cards/RiskProgressionCard";
import RiskTrendChart from "@/components/charts/RiskTrendChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { API_URL } from "@/lib/config";
import { getCopilotSummary } from "@/services/copilot.service";
import {
  createPatient,
} from "@/services/create-patient.service";
import { fetchPatientHistory } from "@/services/patient-history.service";
import { fetchPatients, updatePatient } from "@/services/patient.service";
import { fetchRiskProgression } from "@/services/riskProgression.service";
import {
  getRiskTrend,
} from "@/services/riskTrend.service";
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
import { z } from "zod";

const patientSchema = z.object({
  patient_code: z.string().min(1, "Patient code is required"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.number().min(10, "Age must be at least 10").max(60, "Age must be at most 60"),
  trimester: z.number().min(1, "Trimester must be 1, 2, or 3").max(3, "Trimester must be 1, 2, or 3"),
  pregnancy_week: z.number().min(1, "Pregnancy week must be between 1 and 42").max(42, "Pregnancy week must be between 1 and 42"),
  village: z.string().min(1, "Village is required"),
  blood_group: z.string().regex(/^(A|B|AB|O)[+-]$/i, "Invalid blood group (e.g., A+, O-)"),
  contact_number: z.string().regex(/^\+?[0-9\s-]{10,}$/, "Must be a valid phone number (at least 10 digits)"),
  emergency_contact: z.string().regex(/^\+?[0-9\s-]{10,}$/, "Must be a valid phone number (at least 10 digits)").optional().or(z.literal("")),
  height_cm: z.number().min(100, "Height is required for AI prediction (min 100cm)").max(250, "Height must be realistic (max 250cm)"),
});

// ── Helpers declared outside page component ───────────────────────────────────

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    HIGH: "bg-red-500/15 text-red-400 border-red-500/30",
    MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    LOW: "bg-green-500/15 text-green-400 border-green-500/30",
  };
  const cls = map[risk?.toUpperCase()] ?? "bg-gray-100 dark:bg-[#1e2535] text-gray-600 dark:text-[#5a6478] border-gray-200 dark:border-[#1e2535] transition-colors duration-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
      {risk ?? "—"}
    </span>
  );
}


function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    CRITICAL: "bg-red-600/20 text-red-300 border-red-600/40",
    HIGH: "bg-red-500/15 text-red-400 border-red-500/30",
    MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    LOW: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  const cls = map[severity?.toUpperCase()] ?? "bg-gray-100 dark:bg-[#1e2535] text-gray-600 dark:text-[#5a6478] border-gray-200 dark:border-[#1e2535] transition-colors duration-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
      {severity ?? "—"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    RESOLVED: "bg-green-500/15 text-green-400 border-green-500/30",
    PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    ACTIVE: "bg-red-500/15 text-red-400 border-red-500/30",
    OPEN: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  const cls = map[status?.toUpperCase()] ?? "bg-gray-100 dark:bg-[#1e2535] text-gray-600 dark:text-[#5a6478] border-gray-200 dark:border-[#1e2535] transition-colors duration-300";
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
  icon?: React.ReactNode;
  count?: number;
  empty?: boolean;
  emptyLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
      {/* card header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1e2535] flex items-center justify-between transition-colors duration-300">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-blue-600 dark:text-[#4a7fa8] flex items-center gap-2 transition-colors duration-300">
          {icon}
          {title}
        </p>
        {count !== undefined && (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-[#0f1f32] border border-blue-200 dark:border-[#1e3350] text-blue-700 dark:text-[#4a6fa0] text-[11px] font-bold font-mono transition-colors duration-300">
            {count}
          </span>
        )}
      </div>
      {empty ? (
        <div className="px-6 py-10 text-center">
          <p className="text-[13px] text-gray-500 dark:text-[#2d3a50] italic transition-colors duration-300">{emptyLabel}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-[#181f30] last:border-0 transition-colors duration-300">
      <span className="text-[12px] text-gray-500 dark:text-[#3a4a68] w-28 shrink-0 pt-0.5 transition-colors duration-300">{label}</span>
      <span className="text-[13px] text-gray-900 dark:text-[#c8d0e0] font-medium transition-colors duration-300">{value ?? "—"}</span>
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
  const [progression, setProgression] =
    useState<any>(null);
  const [showModal, setShowModal] =
    useState(false);
  const [copilotSummary, setCopilotSummary] =
    useState<string>("");
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [loadingSummary, setLoadingSummary] =
    useState(false);
  type TrendPoint = {
    clinical_score: number;
    predicted_at: string;
  };

  const [trendData, setTrendData] =
    useState<TrendPoint[]>([]);

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

  const resetForm = () => {
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
      height_cm: 0.0
    });
    setModalMode("CREATE");
    setEditingPatientId(null);
    setFormErrors({});
  };

  const handleEditClick = () => {
    if (!history?.patient) return;
    setModalMode("EDIT");
    setEditingPatientId(history.patient.id);
    setForm({
      patient_code: history.patient.patient_code || "",
      full_name: history.patient.full_name || "",
      age: history.patient.age || 0,
      trimester: history.patient.trimester || 1,
      pregnancy_week: history.patient.pregnancy_week || 1,
      village: history.patient.village || "",
      blood_group: history.patient.blood_group || "",
      contact_number: history.patient.contact_number || "",
      emergency_contact: history.patient.emergency_contact || "",
      height_cm: history.patient.height_cm || 0,
    });
    setShowModal(true);
  };

  useEffect(() => {
    if (!selectedPatient) return;

    async function loadProgression() {
      try {
        const data =
          await fetchRiskProgression(
            selectedPatient
          );

        setProgression(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadProgression();
  }, [selectedPatient]);

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

  const handleSavePatient =
    async () => {
      const result = patientSchema.safeParse(form);
      if (!result.success) {
        const flatErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
const fieldErrors: Record<string, string> = {};
for (const key in flatErrors) {
  if (flatErrors[key] && flatErrors[key]!.length > 0) {
    fieldErrors[key] = flatErrors[key]![0];
  }
}
        setFormErrors(fieldErrors);
        return;
      }
      setFormErrors({});

      setCreating(true);
      try {
        if (modalMode === "CREATE") {
          await createPatient(form);
          const updatedPatients = await fetchPatients();
          setPatients(updatedPatients);
          const createdPatient = updatedPatients.find((p: any) => p.patient_code === form.patient_code);

          if (createdPatient) {
            setSelectedPatient(createdPatient.id);
            await loadHistory(createdPatient.id);
          }
        } else if (modalMode === "EDIT" && editingPatientId) {
          await updatePatient(editingPatientId, form);
          const updatedPatients = await fetchPatients();
          setPatients(updatedPatients);
          await loadHistory(editingPatientId);
        }

        setShowModal(false);
        resetForm();

      } catch (error) {
        console.error(error);
      } finally {
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

  useEffect(() => {
    if (!selectedPatient) return;

    async function loadTrend() {
      try {
        const data = await getRiskTrend(selectedPatient); // was: selectedPatient.id
        setTrendData(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadTrend();
  }, [selectedPatient]);

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
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      >
        {/* Dropdown selector */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1e2535] transition-colors duration-300">
          <select
            value={selectedPatient}
            onChange={handleSelectChange}
            className="w-full sm:w-72 bg-gray-50 dark:bg-[#0d1118] border border-gray-200 dark:border-[#1e2535] hover:border-gray-300 dark:hover:border-[#2a3650] focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none text-gray-900 dark:text-[#c8d0e0] text-[13px] rounded-xl px-4 py-2 transition-all duration-200"
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
            <tr className="bg-gray-50 dark:bg-[#0d1118] transition-colors duration-300">
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-gray-500 dark:text-[#2d3a50]">Patient</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-gray-500 dark:text-[#2d3a50]">Village</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold tracking-widest uppercase text-gray-500 dark:text-[#2d3a50]">Patient Code</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr
                key={p.id}
                onClick={() => handleRowClick(p.id)}
                className={`border-t border-gray-100 dark:border-[#1a2235] cursor-pointer transition-colors duration-150
                  ${selectedPatient === p.id ? "bg-blue-50 dark:bg-[#0f1f38]" : "hover:bg-gray-50 dark:hover:bg-[#0d1520]"}`}
              >
                <td className="px-6 py-4 text-[13px] text-gray-900 dark:text-[#c8d0e0] font-medium transition-colors duration-300">{p.full_name}</td>
                <td className="px-6 py-4 text-[13px] text-gray-500 dark:text-[#5a6478] transition-colors duration-300">{p.village}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-[#0f1f32] border border-blue-200 dark:border-[#1e3350] text-blue-700 dark:text-[#4a7fa8] text-[11px] font-mono transition-colors duration-300">
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
        <div className="mt-6 bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl px-6 py-12 text-center shadow-sm dark:shadow-none transition-colors duration-300">
          <p className="text-[13px] text-blue-600 dark:text-[#4a7fa8] animate-pulse transition-colors duration-300">Loading patient history…</p>
        </div>
      )}

      {/* ── History: each section is its own card ── */}
      {history && (
        <div className="mt-6 flex flex-col gap-5">

          {progression && (
            <RiskProgressionCard
              trend={progression.trend}
              change={progression.change}
              latestScore={progression.latest_score}
              averageScore={progression.average_score}
              alert={progression.alert}
            />
          )}
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
                    <p className="text-sm text-red-500 dark:text-red-400 transition-colors duration-300">
                      Unable to load patient trends
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[#5a6478] mt-1 transition-colors duration-300">
                      Please try again later.
                    </p>
                  </div>
                </div>
              ) : (!trends?.hemoglobin?.length && !trends?.blood_pressure?.length && !trends?.blood_sugar?.length && !trends?.heart_rate?.length) ? (
                <div className="h-72 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-[#8b95a7] transition-colors duration-300">
                      No trend data available
                    </p>
                    <p className="text-xs text-gray-400 dark:text-[#5a6478] mt-1 transition-colors duration-300">
                      Upload OCR reports to visualize patient trends.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Hemoglobin */}
                  <div className="bg-white dark:bg-[#0d1118] border border-gray-200 dark:border-[#1e2535] rounded-xl p-4 transition-colors duration-300">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[#c8d0e0] mb-4 transition-colors duration-300">Hemoglobin (g/dL)</h3>
                    <div className="h-48">
                      {!trends.hemoglobin?.length ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-[#5a6478] transition-colors duration-300">No data available</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trends.hemoglobin}>
                            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "#5a6478", fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                            <YAxis tick={{ fill: "#5a6478", fontSize: 10 }} width={30} />
                            <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)", borderRadius: "8px" }} />
                            <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} name="Hemoglobin" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Blood Pressure */}
                  <div className="bg-white dark:bg-[#0d1118] border border-gray-200 dark:border-[#1e2535] rounded-xl p-4 transition-colors duration-300">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[#c8d0e0] mb-4 transition-colors duration-300">Blood Pressure (mmHg)</h3>
                    <div className="h-48">
                      {!trends.blood_pressure?.length ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-[#5a6478] transition-colors duration-300">No data available</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trends.blood_pressure}>
                            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "#5a6478", fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                            <YAxis tick={{ fill: "#5a6478", fontSize: 10 }} width={30} />
                            <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)", borderRadius: "8px" }} />
                            <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Blood Sugar */}
                  <div className="bg-white dark:bg-[#0d1118] border border-gray-200 dark:border-[#1e2535] rounded-xl p-4 transition-colors duration-300">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[#c8d0e0] mb-4 transition-colors duration-300">Blood Sugar (mg/dL)</h3>
                    <div className="h-48">
                      {!trends.blood_sugar?.length ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-[#5a6478] transition-colors duration-300">No data available</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trends.blood_sugar}>
                            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "#5a6478", fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                            <YAxis tick={{ fill: "#5a6478", fontSize: 10 }} width={30} />
                            <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)", borderRadius: "8px" }} />
                            <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} name="Blood Sugar" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Heart Rate */}
                  <div className="bg-white dark:bg-[#0d1118] border border-gray-200 dark:border-[#1e2535] rounded-xl p-4 transition-colors duration-300">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[#c8d0e0] mb-4 transition-colors duration-300">Heart Rate (bpm)</h3>
                    <div className="h-48">
                      {!trends.heart_rate?.length ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-[#5a6478] transition-colors duration-300">No data available</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trends.heart_rate}>
                            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "#5a6478", fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                            <YAxis tick={{ fill: "#5a6478", fontSize: 10 }} width={30} />
                            <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)", borderRadius: "8px" }} />
                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Heart Rate" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </SectionCard>


          {/* ── Patient Details ── */}
          <SectionCard
            title="Patient Details"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          >
            <div className="px-6 py-1">
              <MetaRow label="Full name" value={history.patient.full_name} />
              <MetaRow label="Village" value={history.patient.village} />
              <MetaRow label="Age" value={history.patient.age ? `${history.patient.age} yrs` : undefined} />
              <MetaRow label="Patient code" value={
                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-[#0f1f32] border border-blue-200 dark:border-[#1e3350] text-blue-700 dark:text-[#4a7fa8] font-mono text-[11px] transition-colors duration-300">
                  {history.patient.patient_code}
                </span>
              } />
            </div>

            <div className="px-4 sm:px-6 pb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() =>
                  window.open(
                    `${API_URL}/api/report/${history.patient.id}`
                  )
                }
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-[13px] sm:text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
              >
                Download Clinical Report
              </button>

              <button
                onClick={handleEditClick}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-[13px] sm:text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
              >
                Edit Patient
              </button>

              <button
                onClick={() =>
                  handleGenerateSummary(
                    history.patient.id
                  )
                }
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-[13px] sm:text-sm bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                {loadingSummary
                  ? "AI Analyzing Patient..."
                  : "Generate AI Summary"}
              </button>
            </div>

            {copilotSummary && (
              <div className="mx-6 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-[#0d1118] border border-gray-200 dark:border-[#1e2535] transition-colors duration-300">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  AI Clinical Summary
                </h3>

                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-[#c8d0e0] transition-colors duration-300">
                  {copilotSummary}
                </pre>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Risk Timeline"
          >
            <div className="p-4">
              <RiskTrendChart
                data={trendData}
              />
            </div>
          </SectionCard>

          {/* ── OCR Reports ── */}
          <SectionCard
            title="OCR Reports"
            count={history.ocr_reports.length}
            emptyLabel="No OCR reports found"
            empty={history.ocr_reports.length === 0}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
          >
            <div className="divide-y divide-gray-100 dark:divide-[#1a2235] transition-colors duration-300">
              {history.ocr_reports.map((report: any) => (
                <div key={report.id} className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-[#3a4a68] mb-1.5 transition-colors duration-300">Hemoglobin</p>
                    <p className="text-[14px] font-semibold text-gray-900 dark:text-[#c8d0e0] transition-colors duration-300">{formatOcrValue(report.parsed_json?.hemoglobin)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-[#3a4a68] mb-1.5 transition-colors duration-300">Blood pressure</p>
                    <p className="text-[14px] font-semibold text-gray-900 dark:text-[#c8d0e0] transition-colors duration-300">{formatOcrValue(report.parsed_json?.blood_pressure)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-[#3a4a68] mb-1.5 transition-colors duration-300">Blood sugar</p>
                    <p className="text-[14px] font-semibold text-gray-900 dark:text-[#c8d0e0] transition-colors duration-300">{formatOcrValue(report.parsed_json?.blood_sugar)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-[#3a4a68] mb-1.5 transition-colors duration-300">Uploaded</p>
                    <p className="text-[12px] text-gray-400 dark:text-[#5a6478] transition-colors duration-300">{new Date(report.uploaded_at).toLocaleString()}</p>
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          >
            <div className="divide-y divide-gray-100 dark:divide-[#1a2235] transition-colors duration-300">
              {history.predictions.map((pred: any) => (
                <div key={pred.id} className="px-4 sm:px-6 py-4 grid grid-cols-2 sm:flex sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6">
                  <div className="min-w-[110px]">
                    <p className="text-[11px] text-gray-500 dark:text-[#3a4a68] mb-1.5 transition-colors duration-300">Overall risk</p>
                    <RiskBadge risk={pred.overall_risk} />
                  </div>
                  <div className="min-w-[110px]">
                    <p className="text-[11px] text-gray-500 dark:text-[#3a4a68] mb-1 transition-colors duration-300">Confidence</p>
                    <p className="text-[15px] font-semibold text-gray-900 dark:text-[#c8d0e0] transition-colors duration-300">
                      {pred.confidence_score != null ? `${pred.confidence_score}%` : "—"}
                    </p>
                    {pred.confidence_score != null && (
                      <div className="mt-1.5 h-1 w-20 bg-gray-200 dark:bg-[#1e2535] rounded-full overflow-hidden transition-colors duration-300">
                        <div className="h-full bg-blue-500 dark:bg-[#1a4fa8] rounded-full transition-all duration-700" style={{ width: `${pred.confidence_score}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-[110px]">
                    <p className="text-[11px] text-gray-500 dark:text-[#3a4a68] mb-1 transition-colors duration-300">Clinical score</p>
                    <p className="text-[15px] font-semibold text-gray-900 dark:text-[#c8d0e0] transition-colors duration-300">{pred.clinical_score ?? "—"}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 min-w-[140px] sm:ml-auto">
                    <p className="text-[11px] text-gray-500 dark:text-[#3a4a68] mb-1 transition-colors duration-300">Predicted at</p>
                    <p className="text-[12px] text-gray-400 dark:text-[#5a6478] transition-colors duration-300">{new Date(pred.predicted_at).toLocaleString()}</p>
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
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
          >
            <div className="divide-y divide-gray-100 dark:divide-[#1a2235] transition-colors duration-300">
              {history.alerts.map((alert: any) => (
                <div key={alert.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <SeverityBadge severity={alert.severity} />
                    <StatusBadge status={alert.status} />
                  </div>
                  <p className="text-[13px] text-gray-800 dark:text-[#c8d0e0] leading-relaxed mb-2 transition-colors duration-300">
                    {alert.alert_message}
                  </p>
                  <p className="text-[12px] text-gray-500 dark:text-[#3a4a68] transition-colors duration-300">
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

          <div className="bg-white dark:bg-[#131720] border border-gray-200 dark:border-[#1e2535] rounded-2xl p-6 w-full max-w-lg shadow-xl">

            <h2 className="text-xl text-gray-900 dark:text-white font-semibold mb-4">
              {modalMode === "CREATE" ? "Create Patient" : "Edit Patient"}
            </h2>

            <div className="space-y-3">

              <div>
                <input
                  value={form.patient_code}
                  placeholder="Patient Code"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.patient_code ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, patient_code: e.target.value })}
                />
                {formErrors.patient_code && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.patient_code}</p>}
              </div>

              <div>
                <input
                  value={form.full_name}
                  placeholder="Full Name"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.full_name ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
                {formErrors.full_name && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.full_name}</p>}
              </div>

              <div>
                <input
                  value={form.age || ""}
                  type="number"
                  placeholder="Age"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.age ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                />
                {formErrors.age && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.age}</p>}
              </div>

              <div>
                <input
                  type="number"
                  value={form.trimester || ""}
                  placeholder="Trimester"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.trimester ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, trimester: Number(e.target.value) })}
                />
                {formErrors.trimester && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.trimester}</p>}
              </div>

              <div>
                <input
                  type="number"
                  value={form.pregnancy_week || ""}
                  placeholder="Pregnancy Week"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.pregnancy_week ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, pregnancy_week: Number(e.target.value) })}
                />
                {formErrors.pregnancy_week && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.pregnancy_week}</p>}
              </div>

              <div>
                <input
                  value={form.village}
                  placeholder="Village"
                  disabled={modalMode === "EDIT"}
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.village ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-60 disabled:cursor-not-allowed`}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                />
                {formErrors.village && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.village}</p>}
              </div>

              <div>
                <input
                  value={form.blood_group}
                  placeholder="Blood Group"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.blood_group ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                />
                {formErrors.blood_group && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.blood_group}</p>}
              </div>

              <div>
                <input
                  value={form.contact_number}
                  placeholder="Phone Number"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.contact_number ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                />
                {formErrors.contact_number && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.contact_number}</p>}
              </div>

              <div>
                <input
                  value={form.emergency_contact}
                  placeholder="Emergency Contact"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.emergency_contact ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                />
                {formErrors.emergency_contact && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.emergency_contact}</p>}
              </div>

              <div>
                <input
                  type="number"
                  value={form.height_cm || ""}
                  placeholder="Height (cm)"
                  className={`w-full p-3 rounded-lg bg-gray-50 dark:bg-[#0d1118] text-gray-900 dark:text-white border ${formErrors.height_cm ? "border-red-500" : "border-gray-200 dark:border-transparent"} focus:border-blue-500 dark:focus:border-[#1a4fa8] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
                  onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
                />
                {formErrors.height_cm && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.height_cm}</p>}
              </div>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSavePatient}
                disabled={creating}
                className="
            px-4 py-2
            rounded-lg
            bg-blue-600
            text-white
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
              >
                {creating
                  ? "Saving..."
                  : "Save"}
              </button>



            </div>



          </div>

        </div>
      )}

    </DashboardLayout>
  );
}