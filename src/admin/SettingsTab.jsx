import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import '../css/AdminPage.css';

export default function SettingsTab({ settings, onSave }) {
  const [local, setLocal] = useState(settings);

  useEffect(() => { setLocal(settings); }, [settings]);

  const handleChange = (path, value) => {
    setLocal(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        cur[p] = cur[p] || {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(local);
  };

  const handleResetDefaults = () => {
    const defaults = {
      siteTitle: 'Mystic Survey',
      showContactLink: true,
      defaultAdminTab: 'dashboard',
      surveysDefaultSubTab: 'list',
      databaseDefaultTab: null,
      notifications: { users: true, surveys: true, database: true, export: true, refresh: true, analytics: true, maxItems: 50, autoClearMs: 0 },
      uiDensity: 'comfortable',
      export: { delimiter: ',', includeHeaders: true, filenamePrefix: 'export' },
      autoRefreshSec: 0,
      confirmations: { delete: true },
      surveys: { defaultQuestionCount: 1, defaultActive: true, showTopBars: true },
      header: { hideOnScroll: true },
      analytics: { showAnswers: true, showResults: true, showUserEmails: true, maxItems: 100 }
    };
    setLocal(defaults);
  };

  const Hint = ({ children }) => (
    <div style={{color:'#9ca3af', fontSize:12}}>{children}</div>
  );
  const Divider = () => (
    <div style={{height:1, background:'#1f1f1f', margin:'4px 0 8px 0'}}/>
  );

  return (
    <div className="tab-content">
      <div className="users-header" style={{paddingLeft:0,paddingRight:0, marginBottom:16}}>
        <div className="header-left">
          <div>
            <h2>Ayarlar</h2>
            <p>Site ve admin paneli için genel ayarlar</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-grid">
          <div className="settings-card">
            <h3>Site Ayarları</h3>
            <label>Site Başlığı</label>
            <input type="text" value={local.siteTitle || ''} onChange={(e)=>handleChange('siteTitle', e.target.value)} />
            <Hint>Anasayfadaki logo metnini günceller</Hint>
            <Divider />
            <label>
              <input type="checkbox" checked={!!local.showContactLink} onChange={(e)=>handleChange('showContactLink', e.target.checked)} /> İletişim linkini göster
            </label>
            <label>UI Yoğunluğu</label>
            <select value={local.uiDensity || 'comfortable'} onChange={(e)=>handleChange('uiDensity', e.target.value)}>
              <option value="comfortable">Rahat</option>
              <option value="compact">Kompakt</option>
            </select>
            <Hint>Kompakt mod daha dar paddingle içerikleri sıkı gösterir</Hint>
            <Divider />
            <label>
              <input type="checkbox" checked={!!local.header?.hideOnScroll} onChange={(e)=>handleChange('header.hideOnScroll', e.target.checked)} /> Header kaydırmada gizlensin
            </label>
          </div>

          <div className="settings-card">
            <h3>Admin Sayfası</h3>
            <label>Varsayılan Sekme</label>
            <select value={local.defaultAdminTab || 'dashboard'} onChange={(e)=>handleChange('defaultAdminTab', e.target.value)}>
              <option value="dashboard">Kontrol Paneli</option>
              <option value="analytics">Analiz</option>
              <option value="users">Kullanıcılar</option>
              <option value="surveys">Anketler</option>
              <option value="database">Database</option>
              <option value="settings">Ayarlar</option>
            </select>
            <label>Varsayılan Anket Alt Sekmesi</label>
            <select value={local.surveysDefaultSubTab || 'list'} onChange={(e)=>handleChange('surveysDefaultSubTab', e.target.value)}>
              <option value="list">Anketler</option>
              <option value="create">Anket Ekle</option>
              <option value="edit">Anket Düzenle</option>
            </select>
            <label>Database Varsayılan Sekmesi</label>
            <select value={local.databaseDefaultTab ?? ''} onChange={(e)=>handleChange('databaseDefaultTab', e.target.value || null)}>
              <option value="">(Yok - tab seçilmesin)</option>
              <option value="users">Üyeler</option>
              <option value="surveys">Anketler</option>
              <option value="categories">Kategoriler</option>
            </select>
            <Divider />
            <label>Otomatik Yenileme (saniye)</label>
            <input type="number" min="0" value={local.autoRefreshSec ?? 0} onChange={(e)=>handleChange('autoRefreshSec', Math.max(0, parseInt(e.target.value || '0', 10)))} />
            <Hint>0 devre dışı bırakır</Hint>
          </div>

          <div className="settings-card">
            <h3>Bildirimler</h3>
            <label>
              <input type="checkbox" checked={!!local.notifications?.users} onChange={(e)=>handleChange('notifications.users', e.target.checked)} /> Kullanıcı işlemleri
            </label>
            <label>
              <input type="checkbox" checked={!!local.notifications?.surveys} onChange={(e)=>handleChange('notifications.surveys', e.target.checked)} /> Anket işlemleri
            </label>
            <label>
              <input type="checkbox" checked={!!local.notifications?.database} onChange={(e)=>handleChange('notifications.database', e.target.checked)} /> Database işlemleri
            </label>
            <label>
              <input type="checkbox" checked={!!local.notifications?.export} onChange={(e)=>handleChange('notifications.export', e.target.checked)} /> Dışa aktarma
            </label>
            <label>
              <input type="checkbox" checked={!!local.notifications?.refresh} onChange={(e)=>handleChange('notifications.refresh', e.target.checked)} /> Yenileme
            </label>
            <label>
              <input type="checkbox" checked={!!local.notifications?.analytics} onChange={(e)=>handleChange('notifications.analytics', e.target.checked)} /> Analiz işlemleri
            </label>
            <Divider />
            <label>Bildirim Maksimum Sayısı</label>
            <input type="number" min="1" max="200" value={local.notifications?.maxItems ?? 50} onChange={(e)=>handleChange('notifications.maxItems', Math.min(200, Math.max(1, parseInt(e.target.value || '1', 10))))} />
            <label>Bildirim Otomatik Temizleme (ms)</label>
            <input type="number" min="0" step="100" value={local.notifications?.autoClearMs ?? 0} onChange={(e)=>handleChange('notifications.autoClearMs', Math.max(0, parseInt(e.target.value || '0', 10)))} />
          </div>

          <div className="settings-card">
            <h3>Dışa Aktarma</h3>
            <label>Ayırıcı</label>
            <select value={local.export?.delimiter || ','} onChange={(e)=>handleChange('export.delimiter', e.target.value)}>
              <option value=",">Virgül (,)</option>
              <option value=";">Noktalı Virgül (;)</option>
              <option value="\t">Sekme (TAB)</option>
              <option value="|">Dikey Çizgi (|)</option>
            </select>
            <label>
              <input type="checkbox" checked={local.export?.includeHeaders !== false} onChange={(e)=>handleChange('export.includeHeaders', e.target.checked)} /> Başlık satırını ekle
            </label>
            <label>Dosya adı öneki</label>
            <input type="text" value={local.export?.filenamePrefix || 'export'} onChange={(e)=>handleChange('export.filenamePrefix', e.target.value)} />
          </div>

          <div className="settings-card">
            <h3>Onaylar & Varsayılanlar</h3>
            <label>
              <input type="checkbox" checked={!!local.confirmations?.delete} onChange={(e)=>handleChange('confirmations.delete', e.target.checked)} /> Silme işlemi için onay iste
            </label>
            <Divider />
            <label>Yeni Anket Varsayılan Soru Sayısı</label>
            <input type="number" min="1" max="20" value={local.surveys?.defaultQuestionCount ?? 1} onChange={(e)=>handleChange('surveys.defaultQuestionCount', Math.min(20, Math.max(1, parseInt(e.target.value || '1', 10))))} />
            <label>
              <input type="checkbox" checked={local.surveys?.defaultActive !== false} onChange={(e)=>handleChange('surveys.defaultActive', e.target.checked)} /> Yeni anket aktif olsun
            </label>
            <label>
              <input type="checkbox" checked={local.surveys?.showTopBars !== false} onChange={(e)=>handleChange('surveys.showTopBars', e.target.checked)} /> Anket alt sekmelerinde üst seçim barlarını göster
            </label>
          </div>

          <div className="settings-card">
            <h3>Analiz</h3>
            <label>
              <input type="checkbox" checked={local.analytics?.showAnswers !== false} onChange={(e)=>handleChange('analytics.showAnswers', e.target.checked)} /> Kullanıcı cevaplarını göster
            </label>
            <label>
              <input type="checkbox" checked={local.analytics?.showResults !== false} onChange={(e)=>handleChange('analytics.showResults', e.target.checked)} /> Kullanıcının gördüğü sonucu göster
            </label>
            <label>
              <input type="checkbox" checked={local.analytics?.showUserEmails !== false} onChange={(e)=>handleChange('analytics.showUserEmails', e.target.checked)} /> Kullanıcı emailini göster
            </label>
            <label>Maksimum satır</label>
            <input type="number" min="10" max="500" value={local.analytics?.maxItems ?? 100} onChange={(e)=>handleChange('analytics.maxItems', Math.min(500, Math.max(10, parseInt(e.target.value || '100', 10))))} />
          </div>
        </div>

        <div className="modal-actions" style={{justifyContent:'space-between', marginTop: 16}}>
          <button type="button" className="btn-secondary" onClick={handleResetDefaults}>Varsayılanlara Sıfırla</button>
          <button type="submit" className="btn-primary"><Save size={16}/> Kaydet</button>
        </div>
      </form>
    </div>
  );
} 