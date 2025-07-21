import React, { useEffect, useState } from "react";
import Document from "./Document";
import { useAuth } from "../hooks/useAuth";
import { jsonRequest, deleteRequest } from "../api/client";
import UploadDocument from "./UploadDocument";

const PatientDetails = ({ patient_id }) => {
  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, access } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = access;

        // Fetch patient details
        const patientData = await jsonRequest(`/patients/${patient_id}/`, { method: "GET" }, accessToken);
        setPatient(patientData);

        // Fetch patient documents
        const docsData = await jsonRequest(`patients/${patient_id}/documents/`, { method: "GET" }, accessToken);
        setDocuments(docsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patient_id]);

  const handleDeleteDocument = async (document_id) => {
    try {
      const accessToken = access;
      const res = await deleteRequest(`/patients/${patient_id}/documents/${document_id}/`, accessToken)
      setDocuments(documents.filter((doc) => doc.document_id !== document_id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading patient details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!patient) return null;

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Patient Info Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {patient.user.first_name} {patient.user.last_name}
        </h2>
        {/* <p className="text-gray-600">Username: {patient.user.username}</p> */}
        <p className="text-gray-600">Age: {patient.age}</p>
        <p className="text-gray-600">Sex: {patient.sex}</p>
        <p className="text-gray-600">
          Health: {patient.health_description}
        </p>
      </div>
        {user.patient_id == patient_id?
            <UploadDocument
                patientId={patient_id}
                onUploadSuccess={() => {
                    // Refresh documents list
                    setDocuments((docs) => [...docs]); // quick refresh trigger or re-fetch documents
                }}
            />:null
        }   

      {/* Documents List */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Documents</h3>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded.</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Document
                key={doc.document_id}
                patientId={patient_id}
                document={doc}
                onDelete={handleDeleteDocument}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;
