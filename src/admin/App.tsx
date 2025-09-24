import './App.css'
import MainDashboard from './pages/MainDashboard'
import OrganizationDashboard from './pages/OrganizationDashboard'
import { Routes, Route } from 'react-router-dom'

function App() {


  return (
    <Routes>
      <Route path="/" element={<MainDashboard />} />
      <Route path="/organizationDashboard" element={<OrganizationDashboard />} />
    </Routes>

  )
}

export default App
