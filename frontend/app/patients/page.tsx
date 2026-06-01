/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchPatients } from "@/services/patient.service";

import { fetchPatientHistory } from "@/services/patient-history.service";

export default function PatientsPage() {

  const [patients, setPatients] = useState<any[]>([]);

const [selectedPatient, setSelectedPatient] =
  useState("");

const [history, setHistory] =
  useState<any>(null);

  useEffect(() => {

  const loadPatients = async () => {

    try {

      const data =
        await fetchPatients();

      setPatients(data);

    } catch (error) {

      console.error(error);

    }
  };

  loadPatients();

}, []);
  
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

        <button className="
          bg-blue-600 hover:bg-blue-700
          text-white
          px-5 py-3 rounded-xl
          font-medium transition-all duration-300 cursor-pointer shadow-sm active:scale-95
        ">
          + Add Patient
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


      <div className="mb-6">

  <select

    value={selectedPatient}

    onChange={async (e) => {

      const patientId =
        e.target.value;

      setSelectedPatient(
        patientId
      );

      if (!patientId) return;

      const data =
        await fetchPatientHistory(
          patientId
        );

      setHistory(data);

    }}

    className="bg-[#131720] border border-[#1e2535] rounded-xl px-4 py-2"

  >

    <option value="">
      Select Patient
    </option>

    {patients.map((patient) => (

      <option
        key={patient.id}
        value={patient.id}
      >

        {patient.patient_code}
        {" - "}
        {patient.full_name}

      </option>

    ))}

  </select>

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
                Patient Code
              </th>
              
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => (

<tr key={patient.id} className="border-t border-[#1a2235]">

  <td className="px-6 py-4">
  {patient.full_name}
</td>

<td className="px-6 py-4">
  {patient.village}
</td>

<td className="px-6 py-4">
  {patient.patient_code}
</td>

</tr>

))}
          </tbody>
        </table>
{/* Patient details */}
        {history && (

  <div className="mt-8 p-6 border border-[#1e2535] rounded-2xl">

    <h2 className="text-xl font-semibold mb-4">
      Patient Details
    </h2>

    <p>
      Name: {history.patient.full_name}
    </p>

    <p>
      Village: {history.patient.village}
    </p>

    <p>
      Age: {history.patient.age}
    </p>

    <p>
      Patient Code:
      {" "}
      {history.patient.patient_code}
    </p>

  </div>

)}
      {/* OCR REPORTS */}
{history && (

  <>
    <h3 className="mt-6 text-lg font-semibold">
      OCR Reports
    </h3>

    {history.ocr_reports.length === 0 ? (

      <p className="text-zinc-500 mt-2">
        No OCR reports found
      </p>

    ) : (

      history.ocr_reports.map((report: any) => (

        <div
          key={report.id}
          className="mt-3 p-4 border border-[#1e2535] rounded-xl"
        >

          <p>
            Hb: {report.parsed_json?.hemoglobin}
          </p>

          <p>
            BP: {report.parsed_json?.blood_pressure}
          </p>

          <p>
            Sugar: {report.parsed_json?.blood_sugar}
          </p>
          <p>
          Uploaded:
          {" "}
          {new Date(report.uploaded_at)
            .toLocaleString()}
        </p>

        </div>

      ))

    )}
  </>

)}

{/* Predictions */}
{history && (

  <>
    <h3 className="mt-6 text-lg font-semibold">
      Predictions
    </h3>

    {history.predictions.length === 0 ? (

      <p className="text-zinc-500 mt-2">
        No predictions found
      </p>

    ) : (

      history.predictions.map(
        (prediction: any) => (

          <div
            key={prediction.id}
            className="mt-3 p-4 border border-[#1e2535] rounded-xl"
          >

            <p>
              Risk:
              {" "}
              {prediction.overall_risk}
            </p>

            <p>
              Confidence:
              {" "}
              {prediction.confidence_score}
            </p>

            <p>
              Clinical Score:
              {" "}
              {prediction.clinical_score}
            </p>

            <p>
          Predicted:
          {" "}
          {new Date(prediction.predicted_at)
            .toLocaleString()}
        </p>

          </div>

        )
      )

    )}
  </>

)}

{/* Alerts */}
{history && (

  <>
    <h3 className="mt-6 text-lg font-semibold">
      Alerts
    </h3>

    {history.alerts.length === 0 ? (

      <p className="text-zinc-500 mt-2">
        No alerts found
      </p>

    ) : (

      history.alerts.map(
        (alert: any) => (

          <div
            key={alert.id}
            className="mt-3 p-4 border border-[#1e2535] rounded-xl"
          >

            <p>
              {alert.alert_message}
            </p>

            <p>
              Severity:
              {" "}
              {alert.severity}
            </p>

            <p>
              Status:
              {" "}
              {alert.status}
            </p>

            <p>
          Triggered:
          {" "}
          {new Date(alert.triggered_at)
            .toLocaleString()}
        </p>

          </div>

        )
      )

    )}
  </>

)}
      </div>

    </DashboardLayout>
  );
}