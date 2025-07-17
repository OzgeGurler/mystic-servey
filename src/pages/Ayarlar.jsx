
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "../css/Ayarlar.css";

function Ayarlar() {
  const [user, setUser] = useState({ 
    name: "", 
    email: "", 
    password: "" 
    });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("userInfo")) || JSON.parse(sessionStorage.getItem("userInfo"));
    if (savedUser && savedUser.id) {
      setUserId(savedUser.id);
      fetchUser(savedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (id) => {
    try {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser({
          name: userData.name || "",
          email: userData.email || "",
          password: userData.password || "",
        });
      }
    } catch (err) {
      console.error("Kullanıcı bilgisi alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setMessage("Kullanıcı belirlenemedi.");
      return;
    }
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        name: user.name,
        email: user.email,
        password: user.password,
      });
      setMessage("Bilgiler başarıyla güncellendi.");
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      setMessage("Güncelleme sırasında hata oluştu.");
    }
  };

  if (loading) return <div className="settings-container">Yükleniyor...</div>;

  return (
    <div className="settings-container">
      <h2>Ayarlar</h2>
      {message && <div className="settings-message">{message}</div>}
      <form className="settings-form" onSubmit={handleSubmit}>
        <label>İsim</label>
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
          placeholder="İsim"
        />
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <label>Şifre</label>
        <input
          type="password"
          name="password"
          value={user.password}
          onChange={handleChange}
          placeholder="Şifre"
        />
        <button type="submit" className="settings-save-btn">Kaydet</button>
      </form>
    </div>
  );
}

export default Ayarlar;