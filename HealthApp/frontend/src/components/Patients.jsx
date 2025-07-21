import React, { useEffect, useState } from "react";
import PatientDetails from "./PatientDetails";
import { useAuth } from "../hooks/useAuth";
import { jsonRequest } from "../api/client";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { access } = useAuth();


  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const accessToken = access;
        const response = await jsonRequest(`/patients/`, { method: "GET" }, accessToken);
        setPatients(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) return <div className="text-center p-6">Loading patients...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="flex h-screen">
      {/* Left side: Patients List */}
      <div className="w-1/2 border-r overflow-y-auto p-4 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Patients</h2>
        {patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.patient_id}
              onClick={() => setSelectedPatientId(patient.patient_id)}
              className={`cursor-pointer bg-white shadow-md rounded-lg p-4 mb-4 border hover:border-blue-500 transition ${
                selectedPatientId === patient.patient_id ? "border-blue-500" : ""
              }`}
            >
              <h3 className="text-lg font-semibold">
                {patient.user.first_name} {patient.user.last_name}
              </h3>
              <p className="text-sm text-gray-600">Age: {patient.age}</p>
              <p className="text-sm text-gray-600">Sex: {patient.sex}</p>
            </div>
          ))
        )}
      </div>

      {/* Right side: PatientDetails */}
      <div className="w-1/2 p-4">
        {selectedPatientId ? (
          <PatientDetails patient_id={selectedPatientId} />
        ) : (
          <p className="text-gray-500">Select a patient to view details.</p>
        )}
      </div>
    </div>
  );
};

export default Patients;
