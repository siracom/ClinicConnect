import { useState } from "react";
import { jsonRequest } from "../api/client";
import { CenterCard } from "./CenterCard";
import { useAuth } from "../hooks/useAuth";

export default function Register(){
    const { access, user, logout } = useAuth();
    const [mode, setMode] = useState("patient");
    const user_id = user.id
    const PatientForm = () =>{
        const [sex, setSex] = useState('');
        const [age, setAge] = useState('');
        const [description, setDescription] = useState('');
        const registerPatient = async (e) => {
            e.preventDefault()
            const patientData = await jsonRequest(
                `/register-patient/`, 
                { method: "POST", body: JSON.stringify({user_id, sex, age, health_description: description}) }, 
                access
            );
            console.log(patientData);
            logout();
        }
        const disabled = !age || !sex;
        return (
            <form onSubmit={registerPatient} className="space-y-4" noValidate>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="patient-age">Age</label>
                    <input
                    id="patient-age"
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                    autoComplete="age"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="patient-sex">Sex</label>
                    <input
                    id="patient-sex"
                    type="text"
                    required
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                    autoComplete="sex"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="patient-health-description">Description</label>
                    <input
                    id="patient-health-description"
                    type="text"
                    required={false}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                    autoComplete="description"
                    />
                </div>
                {/* {error && (
                    <p className="text-red-600 text-sm" role="alert">{error}</p>
                )} */}
                <button
                    type="submit"
                    disabled={disabled}
                    className={`w-full px-4 py-2 rounded text-white ${disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    Register Patient
                </button>
            </form>
        )
    }

    const ClinicianForm = () => {
        const [gender, setGender] = useState('');
        const [age, setAge] = useState('');
        const [speciality, setSpeciality] = useState(''); 
        
        const registerClinician = async (e) => {
            e.preventDefault()
            const clinicianData = await jsonRequest(
                `/register-clinician/`, 
                { method: "POST", body: JSON.stringify({user_id, gender, age, speciality}) }, 
                access
            );
            console.log(clinicianData);
            logout();
        }
        const disabled = !age || !speciality;
        return (
            <form onSubmit={registerClinician} className="space-y-4" noValidate>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="clinician-age">Age</label>
                    <input
                    id="clinician-age"
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                    autoComplete="age"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="clinician-">Sex</label>
                    <input
                    id="clinician-gender"
                    type="text"
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                    autoComplete="sex"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="clinician-speciality">Speciality</label>
                    <input
                    id="clinician-speciality"
                    type="text"
                    required={false}
                    value={speciality}
                    onChange={(e) => setSpeciality(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                    autoComplete="clinician-speciality"
                    />
                </div>
                {/* {error && (
                    <p className="text-red-600 text-sm" role="alert">{error}</p>
                )} */}
                <button
                    type="submit"
                    disabled={disabled}
                    className={`w-full px-4 py-2 rounded text-white ${disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    Register Clinician
                </button>
            </form>
        )
    }

    return (
        <CenterCard>
            <div className="mb-4 flex justify-center space-x-2" role="tablist">
                <button
                type="button"
                role="tab"
                aria-selected={mode === "patient"}
                onClick={() => setMode("patient")}
                className={`px-3 py-1 rounded ${mode === "patient" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                Patient
                </button>
                <button
                type="button"
                role="tab"
                aria-selected={mode === "clinician"}
                onClick={() => setMode("clinician")}
                className={`px-3 py-1 rounded ${mode === "clinician" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                Clinician
                </button>
            </div>

            {mode === "patient" ? (
                <PatientForm />
            ) : (
                <ClinicianForm />
            )}

            {user?.username && (
                <p className="mt-4 text-xs text-center text-gray-500">Current user: {user.username}</p>
            )}
        </CenterCard>
    )
}