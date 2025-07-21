import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { jsonRequest } from "../api/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const UploadDocument = ({ patientId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const {access} = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be under 5MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a valid PDF file to upload.");
      return;
    }

    try {
      setUploading(true);
      const accessToken = access;

      const formData = new FormData();
      formData.append("file", file);

      const response = await jsonRequest(
        `/patients/${patientId}/documents/upload/`, 
        { method: "POST", body: formData },
        accessToken,
        ''
      )

      setFile(null);
      setError("");

      if (onUploadSuccess) onUploadSuccess();
      alert("Document uploaded successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 p-3 border rounded bg-gray-100">
      <h4 className="font-semibold mb-2">Upload Document</h4>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block mb-2"
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`px-4 py-2 rounded ${
          uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadDocument;
