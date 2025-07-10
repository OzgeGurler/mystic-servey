import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import  {Routes, Route, BrowserRouter} from "react-router-dom"
import Home from './pages/Home.jsx'
import RegisterPage from './pages/Register.jsx'



function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    );
  }
  
  export default App
