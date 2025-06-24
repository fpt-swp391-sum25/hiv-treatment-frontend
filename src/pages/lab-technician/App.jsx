import { Routes, Route } from "react-router-dom";
import Staff from "./staff-page";
import PatientDetail from "./patient-detail";

function App() {
    return (
        <Routes>
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/patient/:id" element={<PatientDetail />} />
        </Routes>
    );
}

export default App;
