import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { Mail, User, MessageSquare, Star, Send, AtSign, ClipboardList } from 'lucide-react';
import feedbackService from '../services/feedbackService.js';

function IletisimPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
      await feedbackService.addFeedback({ ...form, userId: userInfo?.id || null });
      setDone(true);
      setForm({ name: '', email: '', subject: '', message: '', rating: 0 });
      setTimeout(()=>setDone(false), 2000);
    } catch (err) {
      console.error('Feedback gönderilemedi', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="contact-bg">
        <div className="contact-container">
          <div className="contact-header">
            <div className="icon"><ClipboardList size={28} /></div>
            <div>
              <h1>İletişim</h1>
              <p>Görüş ve önerilerinizi bizimle paylaşın. Geri bildirimler ürünümüzü şekillendirir.</p>
            </div>
          </div>

          <div className="contact-grid">
            <form className="contact-card" onSubmit={submit}>
              <div className="form-row">
                <div className="form-field">
                  <label>Ad Soyad</label>
                  <div className="input-wrap"><User size={16} /><input name="name" value={form.name} onChange={handleChange} placeholder="İsteğe bağlı" /></div>
                </div>
                <div className="form-field">
                  <label>E-posta</label>
                  <div className="input-wrap"><AtSign size={16} /><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="İsteğe bağlı" /></div>
                </div>
              </div>
              <div className="form-field">
                <label>Konu</label>
                <div className="input-wrap"><Mail size={16} /><input name="subject" value={form.subject} onChange={handleChange} placeholder="Kısa özet" /></div>
              </div>
              <div className="form-field">
                <label>Mesaj</label>
                <div className="textarea-wrap"><MessageSquare size={16} /><textarea name="message" value={form.message} onChange={handleChange} placeholder="Görüş veya sorununuzu ayrıntılı yazın" rows={5} /></div>
              </div>
              <div className="form-field">
                <label>Memnuniyet</label>
                <div className="rating">
                  {[1,2,3,4,5].map(st => (
                    <button type="button" key={st} className={`star ${form.rating>=st?'on':''}`} onClick={()=>setForm(prev=>({...prev, rating: st}))}><Star size={18} /></button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" disabled={submitting}>
                {submitting ? 'Gönderiliyor...' : <>Gönder <Send size={16} /></>}
              </button>
              {done && <div className="contact-success">Teşekkürler! Geri bildiriminiz kaydedildi.</div>}
            </form>

            <div className="contact-card info">
              <h3>Bize Ulaşın</h3>
              <ul className="contact-list">
                <li><Mail size={16} /> destek@mysticsurvey.com</li>
                <li><MessageSquare size={16} /> Bize mesaj bırakın, 24 saat içinde dönüş yaparız</li>
              </ul>
              <div className="contact-note">Verileriniz gizlilik politikamıza uygun olarak saklanır.</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default IletisimPage;