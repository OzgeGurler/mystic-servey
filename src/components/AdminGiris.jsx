import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../css/AdminPage.css";
import "../css/AdminGiris.css";

function AdminGiris() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadSettings = () => {
    try { return JSON.parse(localStorage.getItem('appSettings')) || {}; }
    catch { return {}; }
  };
  const [settings] = useState(loadSettings());
  const [systemPrefersLight, setSystemPrefersLight] = useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  useEffect(() => {
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
    if (!mq) return;
    const handler = (e) => setSystemPrefersLight(e.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler); };
  }, []);
  const effectiveTheme = useMemo(() => {
    const t = settings.theme || 'dark';
    if (t === 'system') return systemPrefersLight ? 'light' : 'dark';
    return t;
  }, [settings.theme, systemPrefersLight]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password === password) {
          if (userData.role === "admin") {
            const adminUser = { id: userDoc.id, name: userData.name, email: userData.email, role: "admin" };
            localStorage.setItem("userInfo", JSON.stringify(adminUser));
            navigate("/admin");
          } else {
            setError("Bu hesap admin yetkisine sahip değil.");
          }
        } else {
          setError("Yanlış şifre.");
        }
      } else {
        setError("Kullanıcı bulunamadı.");
      }
    } catch (err) {
      console.error("Login hatası:", err);
      setError("Giriş sırasında hata oluştu.");
    }
  };

  return (
    <div className={`dashboard ${effectiveTheme === 'light' ? 'theme-light' : ''}`}>
      <div className="main-content">
        <div className="header admin-header">
          <div className="header-left">
            <div className="breadcrumb">{settings.siteTitle || 'Mystic Survey'} / Admin Giriş</div>
          </div>
          <div className="header-right" />
        </div>
        <div className="dashboard-content">
          <div className="admin-login-wrapper">
            <div className="admin-login-box">
              <h2>Admin Giriş</h2>
              {error && <div className="admin-login-error">{error}</div>}
              <form onSubmit={handleLogin} className="admin-login-form">
                <label>E-posta</label>
                <input
                  type="email"
                  placeholder="admin@ornek.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label>Şifre</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit" className="header-btn admin-login-btn">Giriş Yap</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminGiris;