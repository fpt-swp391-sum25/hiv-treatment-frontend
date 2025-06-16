import { Routes, Route } from "react-router-dom";
import Staff from "./pages/Staff";
import PatientDetail from "./pages/PatientDetail";

function App() {
    return (
        <Routes>
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/patient/:id" element={<PatientDetail />} />
        </Routes>
    );
}

export default App;
