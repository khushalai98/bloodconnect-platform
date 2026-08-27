import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import DonorPortal from './pages/DonorPortal'
import BloodBankPortal from './pages/BloodBankPortal'
import HospitalPortal from './pages/HospitalPortal'
import EmergencySOS from './pages/EmergencySOS'
import AdminPanel from './pages/AdminPanel'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/donor/*" element={<DonorPortal />} />
          <Route path="/blood-bank/*" element={<BloodBankPortal />} />
          <Route path="/hospital/*" element={<HospitalPortal />} />
          <Route path="/emergency" element={<EmergencySOS />} />
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
