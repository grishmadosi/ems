import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CandidateNomination from './pages/CandidateNomination'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/nominate" element={<CandidateNomination />} />
        <Route path="*" element={<Navigate to="/nominate" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
