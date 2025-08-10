import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import '../css/AdminPage.css';

export default function SettingsTab({ settings, onSave, onLiveChange }) {
  const [local, setLocal] = useState(settings);

  useEffect(() => { setLocal(settings); }, [settings]);

  const handleChange = (path, value) => {
    const nextState = (prev => {
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
    })(local);
    setLocal(nextState);
    if (onLiveChange) onLiveChange(nextState);
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
      analytics: { showAnswers: true, showResults: true, showUserEmails: true, maxItems: 100 },
      passwordPolicy: { enabled: false, minLength: 8, requireLower: true, requireUpper: true, requireDigit: true },
      theme: settings.theme || 'dark',
      headerControls: { search: true, filter: true, export: true, refresh: true },
      sidebarWidth: 'normal'
    };
    setLocal(defaults);
    if (onLiveChange) onLiveChange(defaults);
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
            <label>Vurgu Rengi</label>
            <input type="color" value={local.accentColor || '#3b82f6'} onChange={(e)=>handleChange('accentColor', e.target.value)} />
            <Hint>Buton/ikon vurgularında kullanılacak ana renk</Hint>
            <Divider />
            <h4>İletişim Bilgileri</h4>
            <label>Destek E‑posta</label>
            <input type="email" value={local.contactEmail || ''} onChange={(e)=>handleChange('contactEmail', e.target.value)} />
            <label>Destek Telefon</label>
            <input type="tel" value={local.supportPhone || ''} onChange={(e)=>handleChange('supportPhone', e.target.value)} />
            <Divider />
            <label>
              <input type="checkbox" checked={!!local.showContactLink} onChange={(e)=>handleChange('showContactLink', e.target.checked)} /> İletişim linkini göster
            </label>
            <label>Uygulama Dili</label>
            <select value={local.locale || 'tr'} onChange={(e)=>handleChange('locale', e.target.value)}>
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
            <label>Tema</label>
            <select value={local.theme || 'dark'} onChange={(e)=>handleChange('theme', e.target.value)}>
              <option value="dark">Koyu</option>
              <option value="light">Açık</option>
              <option value="system">Sistem</option>
            </select>
            <label>UI Yoğunluğu</label>
            <select value={local.uiDensity || 'comfortable'} onChange={(e)=>handleChange('uiDensity', e.target.value)}>
              <option value="comfortable">Rahat</option>
              <option value="compact">Kompakt</option>
            </select>
            <Divider />
            <h4>Footer</h4>
            <label><input type="checkbox" checked={local.footer?.shimmer !== false} onChange={(e)=>handleChange('footer.shimmer', e.target.checked)} /> Footer shimmer animasyonu</label>
            <Divider />
            <label>
              <input type="checkbox" checked={!!local.header?.hideOnScroll} onChange={(e)=>handleChange('header.hideOnScroll', e.target.checked)} /> Header kaydırmada gizlensin
            </label>
          </div>

          <div className="settings-card">
            <h3>Ana Sayfa</h3>
            <label>Hero Başlık</label>
            <input type="text" value={local.home?.heroTitle || ''} onChange={(e)=>handleChange('home.heroTitle', e.target.value)} />
            <label>Hero Alt Başlık</label>
            <input type="text" value={local.home?.heroSubtitle || ''} onChange={(e)=>handleChange('home.heroSubtitle', e.target.value)} />
          </div>

          <div className="settings-card">
            <h3>Profil & Link</h3>
            <label><input type="checkbox" checked={local.profiles?.allowPublic !== false} onChange={(e)=>handleChange('profiles.allowPublic', e.target.checked)} /> Profiller herkese açık olabilir</label>
            <label>Slug Ayırıcı</label>
            <select value={local.profiles?.slugSeparator || '.'} onChange={(e)=>handleChange('profiles.slugSeparator', e.target.value)}>
              <option value="," disabled>,</option>
              <option value=".">.</option>
              <option value="-">-</option>
              <option value="_">_</option>
            </select>
            <Hint>Örnek: Ali Veli → Ali{local.profiles?.slugSeparator || '.'}Veli</Hint>
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
              <option value="notify">Bildirim</option>
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
            <h4>Üst Bar Butonları</h4>
            <label><input type="checkbox" checked={local.headerControls?.search !== false} onChange={(e)=>handleChange('headerControls.search', e.target.checked)} /> Arama</label>
            <label><input type="checkbox" checked={local.headerControls?.filter !== false} onChange={(e)=>handleChange('headerControls.filter', e.target.checked)} /> Filtre</label>
            <label><input type="checkbox" checked={local.headerControls?.export !== false} onChange={(e)=>handleChange('headerControls.export', e.target.checked)} /> Dışa Aktar</label>
            <label><input type="checkbox" checked={local.headerControls?.refresh !== false} onChange={(e)=>handleChange('headerControls.refresh', e.target.checked)} /> Yenile</label>
            <Divider />
            <label>Kenar Çubuğu Genişliği</label>
            <select value={local.sidebarWidth || 'normal'} onChange={(e)=>handleChange('sidebarWidth', e.target.value)}>
              <option value="normal">Normal</option>
              <option value="wide">Geniş</option>
            </select>
            <Divider />
            <label>Otomatik Yenileme (saniye)</label>
            <input type="number" min="0" value={local.autoRefreshSec ?? 0} onChange={(e)=>handleChange('autoRefreshSec', Math.max(0, parseInt(e.target.value || '0', 10)))} />
            <label>
              <input type="checkbox" checked={!!local.showTooltips} onChange={(e)=>handleChange('showTooltips', e.target.checked)} /> İpuçlarını göster
            </label>
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
              <option value="," >Virgül (,)</option>
              <option value=";">Noktalı Virgül (;)</option>
              <option value="\t">Sekme (TAB)</option>
              <option value="|">Dikey Çizgi (|)</option>
            </select>
            <label>
              <input type="checkbox" checked={local.export?.includeHeaders !== false} onChange={(e)=>handleChange('export.includeHeaders', e.target.checked)} /> Başlık satırını ekle
            </label>
            <label>Dosya adı öneki</label>
            <input type="text" value={local.export?.filenamePrefix || 'export'} onChange={(e)=>handleChange('export.filenamePrefix', e.target.value)} />
            <label>Tarih formatı</label>
            <select value={local.export?.dateFormat || 'iso'} onChange={(e)=>handleChange('export.dateFormat', e.target.value)}>
              <option value="iso">ISO (YYYY-MM-DD)</option>
              <option value="tr">TR (DD.MM.YYYY)</option>
            </select>
          </div>

          <div className="settings-card">
            <h3>Onaylar & Varsayılanlar</h3>
            <label>
              <input type="checkbox" checked={!!local.confirmations?.delete} onChange={(e)=>handleChange('confirmations.delete', e.target.checked)} /> Silme işlemi için onay iste
            </label>
            <Divider />
            <h4>Şifre Politikası</h4>
            <label>
              <input type="checkbox" checked={!!local.passwordPolicy?.enabled} onChange={(e)=>handleChange('passwordPolicy.enabled', e.target.checked)} /> Güçlü şifre politikasını etkinleştir
            </label>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, opacity: local.passwordPolicy?.enabled ? 1 : 0.6}}>
              <label>
                Minimum uzunluk
                <input type="number" min="1" value={local.passwordPolicy?.minLength ?? 8} onChange={(e)=>handleChange('passwordPolicy.minLength', Math.max(1, parseInt(e.target.value||'8',10)))} />
              </label>
              <div>
                <label><input type="checkbox" checked={!!local.passwordPolicy?.requireLower} onChange={(e)=>handleChange('passwordPolicy.requireLower', e.target.checked)} /> Küçük harf</label>
                <label><input type="checkbox" checked={!!local.passwordPolicy?.requireUpper} onChange={(e)=>handleChange('passwordPolicy.requireUpper', e.target.checked)} /> Büyük harf</label>
                <label><input type="checkbox" checked={!!local.passwordPolicy?.requireDigit} onChange={(e)=>handleChange('passwordPolicy.requireDigit', e.target.checked)} /> Rakam</label>
              </div>
            </div>
            <Divider />
            <label>Yeni Anket Varsayılan Soru Sayısı</label>
            <input type="number" min="1" max="20" value={local.surveys?.defaultQuestionCount ?? 1} onChange={(e)=>handleChange('surveys.defaultQuestionCount', Math.min(20, Math.max(1, parseInt(e.target.value || '1', 10))))} />
            <label>
              <input type="checkbox" checked={local.surveys?.defaultActive !== false} onChange={(e)=>handleChange('surveys.defaultActive', e.target.checked)} /> Yeni anket aktif olsun
            </label>
            <label>
              <input type="checkbox" checked={local.surveys?.showTopBars !== false} onChange={(e)=>handleChange('surveys.showTopBars', e.target.checked)} /> Anket alt sekmelerinde üst seçim barlarını göster
            </label>
            <label>
              <input type="checkbox" checked={!!local.surveys?.lockListOnForm} onChange={(e)=>handleChange('surveys.lockListOnForm', e.target.checked)} /> Anket ekle/düzenle açıkken listeyi kilitle
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
            <label>
              <input type="checkbox" checked={!!local.analytics?.includeImages} onChange={(e)=>handleChange('analytics.includeImages', e.target.checked)} /> Görselleri de göster
            </label>
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