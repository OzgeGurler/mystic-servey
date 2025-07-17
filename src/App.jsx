import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from './pages/Home.jsx'
import Header from './components/Header.jsx'
import AnketPage from './pages/Anketler.jsx'
import Footer from './components/Footer.jsx'
import AdminPage from './pages/AdminPage.jsx'
import SolveSurvey from "./pages/SolveSurvey.jsx"
import Profil from './pages/Profil.jsx'
import Ayarlar from './pages/Ayarlar.jsx'



// Tasarımları şuanlık basit ve sade yapıyorum tüm sistemler bitsin öyle detaylandırırım
// ya da istediğin gibi tasarım değişikliğini yapmaya başla

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Anketler" element={<AnketPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/surveys/:id/solve" element={<SolveSurvey />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/ayarlar" element={<Ayarlar />} />





      </Routes>
    </BrowserRouter>
  );
}

export default App
