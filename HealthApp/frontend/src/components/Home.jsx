import { useAuth } from "../hooks/useAuth"; 
import PatientDetails from "./PatientDetails";
import Patients from "./Patients"
import Register from "./Register";

const Home = () => {
    const { logout, user } = useAuth();
    console.log(user)
    return (
        <div className="p-4 space-y-4">
            <header className="flex items-center justify-between border-b pb-2">
                <h1 className="text-2xl font-bold">Health App</h1>
                <div className="space-x-2 text-sm">
                {user?.username && <span className="text-gray-600">{user.first_name},</span>}
                <span style={{fontFamily:"monospace"}}>{user?.clinician_id != ''?'Clinician': user?.patient_id != ''? 'Patient': null}</span>
                <button
                    onClick={logout}
                    className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                    Logout
                </button>
                </div>
            </header>
            {user.clinician_id != ''?
                <Patients />:
                user.patient_id != ''?
                    <PatientDetails patient_id={user.patient_id} />
                    : <Register />
            }
        </div>
    )
}

export default Home;