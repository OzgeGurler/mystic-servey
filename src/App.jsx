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
import RegisterPage from './pages/RegisterPage.jsx'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test1" element={<Footer />} />
        <Route path="/Anketler" element={<AnketPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/register" element={<RegisterPage />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App
