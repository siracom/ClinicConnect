import React, { useState } from "react";
import { FaEye, FaDownload, FaTrash } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const Document = ({ patientId, document, onDelete }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, access } = useAuth();

  const fetchFileBlob = async () => {
    const token = access;
    const response = await fetch(
      `http://127.0.0.1:8000/api/patients/${patientId}/documents/${document.document_id}/download/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch file.");
    return await response.blob();
  };

  const handleDownload = async () => {
    try {
      const blob = await fetchFileBlob();
      const url = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.file_path.split("/").pop();
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePreview = async () => {
    try {
      const blob = await fetchFileBlob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="p-3 border rounded shadow-sm flex items-center justify-between bg-gray-50">
      <div>
        <p className="font-medium text-gray-800">
          {document.file_path.split("/").pop()}
        </p>
        <p className="text-xs text-gray-500">
          Uploaded: {new Date(document.uploaded_time).toLocaleString()}
        </p>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={handlePreview}
          className="text-blue-600 hover:text-blue-800"
          title="Preview"
        >
          <FaEye />
        </button>
        <button
          onClick={handleDownload}
          className="text-green-600 hover:text-green-800"
          title="Download"
        >
          <FaDownload />
        </button>
        {user.patient_id == patientId?
            <button
            onClick={() => onDelete(document.document_id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
            >
            <FaTrash />
            </button>
        :null}
      </div>

      {/* Preview Modal */}
      {isModalOpen && previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-3/4 h-3/4 p-4 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
            >
              Close
            </button>
            <iframe
              src={previewUrl}
              title="PDF Preview"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Document;
