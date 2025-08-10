import './App.css'
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from './pages/Home.jsx'
import AnketPage from './pages/Anketler.jsx'
import AdminPage from './admin/AdminPage.jsx'
import AdminRoute from "./components/AdminRoute";
import SolveSurvey from "./pages/SolveSurvey.jsx"
import Profil from './pages/Profil.jsx'
import Ayarlar from './pages/Ayarlar.jsx'
import AdminGiris from './components/AdminGiris.jsx'
import IletisimPage from './pages/İletisim.jsx'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Anketler" element={<AnketPage />} />
        <Route path="/admin" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
        } />
        <Route path="/surveys/:id/solve" element={<SolveSurvey />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/profil/:slug" element={<Profil />} />
        <Route path="/ayarlar" element={<Ayarlar />} />
        <Route path="/admingiris" element={<AdminGiris />} />
        <Route path="/iletisim" element={<IletisimPage />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App
