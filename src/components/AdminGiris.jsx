import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../css/AdminGiris.css";

function AdminGiris() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>Admin Giriş</h2>
        {error && <div className="admin-login-error">{error}</div>}
        <form onSubmit={handleLogin} className="admin-login-form">
          <input
            type="email"
            placeholder="Admin E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}

export default AdminGiris;