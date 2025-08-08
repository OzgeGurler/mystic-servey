import React, { useEffect, useRef, useState } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { Database, Users, FileText, Folder, RefreshCw, Search, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import '../css/DatabaseTab.css';

export default function DatabaseTab({ onNotify = () => {}, defaultActiveTab = null, settings = {}, externalSearch = '', refreshToken = 0 }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [buffers, setBuffers] = useState({});
  const [savingKey, setSavingKey] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [addCol, setAddCol] = useState('');
  const [addBuffer, setAddBuffer] = useState('');

  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState(defaultActiveTab);


  const [viewOpen, setViewOpen] = useState(false);
  const [viewCol, setViewCol] = useState('');
  const [viewItem, setViewItem] = useState(null);

  const dataScrollRef = useRef(null);

  const showToast = (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2600);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [usersSnap, surveysSnap, categoriesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'surveys')),
        getDocs(collection(db, 'categories')),
      ]);
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSurveys(surveysSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCategories(categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      onNotify({ type: 'info', title: 'Database', message: 'Veriler yenilendi' });
    } catch (e) {
      console.error('DB yüklenemedi', e);
      showToast('Veriler yüklenemedi', 'error');
      onNotify({ type: 'error', title: 'Database', message: 'Veriler yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);


  useEffect(() => { loadAll();}, [refreshToken]);


  useEffect(() => {
    if (activeTab == null) {
      const tab = settings?.databaseDefaultTab ?? null;
      setActiveTab(tab);
    }

  }, [settings]);

  useEffect(() => { setSearch(externalSearch || ''); }, [externalSearch]);

  const filterRows = (rows) => {
    const q = (search || '').toLowerCase();
    if (!q) return rows;
    return rows.filter(row => JSON.stringify(row).toLowerCase().includes(q));
  };

  const keyOf = (col, id) => `${col}:${id}`;
  const onBufferChange = (key, value) => setBuffers(prev => ({ ...prev, [key]: value }));

  const handleReset = (col, item) => {
    const key = keyOf(col, item.id);
    onBufferChange(key, JSON.stringify(item, null, 2));
  };

  const handleSave = async (col, item) => {
    const key = keyOf(col, item.id);
    const raw = buffers[key] ?? JSON.stringify(item, null, 2);
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      showToast('Geçersiz JSON. Lütfen doğru biçimde düzenleyin.', 'error');
      onNotify({ type: 'error', title: 'Kaydetme', message: 'Geçersiz JSON' });
      return;
    }
    const { id: _discardId, ...data } = parsed;
    try {
      setSavingKey(key);
      await updateDoc(doc(db, col, item.id), data);
      if (col === 'users') setUsers(prev => prev.map(r => r.id === item.id ? { id: item.id, ...data } : r));
      if (col === 'surveys') setSurveys(prev => prev.map(r => r.id === item.id ? { id: item.id, ...data } : r));
      if (col === 'categories') setCategories(prev => prev.map(r => r.id === item.id ? { id: item.id, ...data } : r));
      onBufferChange(key, JSON.stringify({ id: item.id, ...data }, null, 2));
      showToast('Kaydedildi', 'success');
      onNotify({ type: 'success', title: 'Kaydetme', message: `${col} koleksiyonunda kayıt güncellendi` });
    } catch (e) {
      console.error('Kaydetme hatası', e);
      showToast('Kaydetme sırasında bir hata oluştu', 'error');
      onNotify({ type: 'error', title: 'Kaydetme', message: 'Kayıt güncellenemedi' });
    } finally {
      setSavingKey('');
    }
  };

  const handleDelete = async (col, item) => {
    const needConfirm = settings?.confirmations?.delete !== false;
    if (needConfirm && !window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, col, item.id));
      if (col === 'users') setUsers(prev => prev.filter(r => r.id !== item.id));
      if (col === 'surveys') setSurveys(prev => prev.filter(r => r.id !== item.id));
      if (col === 'categories') setCategories(prev => prev.filter(r => r.id !== item.id));
      const k = keyOf(col, item.id);
      setBuffers(prev => { const cp = { ...prev }; delete cp[k]; return cp; });
      showToast('Silindi', 'success');
      onNotify({ type: 'success', title: 'Silme', message: `${col} koleksiyonundan kayıt silindi` });
    } catch (e) {
      console.error('Silme hatası', e);
      showToast('Silme sırasında bir hata oluştu', 'error');
      onNotify({ type: 'error', title: 'Silme', message: 'Kayıt silinemedi' });
    }
  };

  const openView = (col, item) => {
    setViewCol(col);
    setViewItem(item);
    setViewOpen(true);
  };
  const closeView = () => { setViewOpen(false); setViewCol(''); setViewItem(null); };

  const renderEditable = (col, item) => {
    const k = keyOf(col, item.id);
    const value = buffers[k] ?? JSON.stringify(item, null, 2);
    return (
      <div className="db-editor">
        <textarea className="db-json" value={value} onChange={(e)=>onBufferChange(k, e.target.value)} />
        <div className="db-actions">
          <button className="btn-danger" onClick={() => handleDelete(col, item)}>
            <Trash2 size={16}/> Sil
          </button>
          <div className="db-actions-right">
            <button className="btn-secondary" onClick={() => handleReset(col, item)}>
              <RotateCcw size={16}/> Reset
            </button>
            <button className="btn-primary" onClick={() => handleSave(col, item)} disabled={savingKey===k}>
              <Save size={16}/> {savingKey===k ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    );
  };


  const templateFor = (col) => {
    switch(col){
      case 'users':
        return { name:'', email:'', phone:'', role:'user', isActive:true, createdAt: new Date().toISOString() };
      case 'surveys':
        return { title:'', description:'', category:'', questionCount:1, questions:[{ id:1, question:'', options:['',''], optionPoints:[0,0]}], results:[], active:true, createdAt: new Date().toISOString() };
      case 'categories':
        return { name:'' };
      default:
        return {};
    }
  };
  const openAdd = (col) => {
    setAddCol(col);
    setAddBuffer(JSON.stringify(templateFor(col), null, 2));
    setAddOpen(true);
  };
  const closeAdd = () => { setAddOpen(false); setAddCol(''); setAddBuffer(''); };
  const saveAdd = async () => {
    try{
      const parsed = JSON.parse(addBuffer || '{}');
      const { id: _discardId, ...data } = parsed;
      const ref = await addDoc(collection(db, addCol), data);
      const newItem = { id: ref.id, ...data };
      if (addCol === 'users') setUsers(prev => [newItem, ...prev]);
      if (addCol === 'surveys') setSurveys(prev => [newItem, ...prev]);
      if (addCol === 'categories') setCategories(prev => [newItem, ...prev]);
      closeAdd();
      showToast('Eklendi', 'success');
      onNotify({ type: 'success', title: 'Ekleme', message: `${addCol} koleksiyonuna yeni kayıt eklendi` });
    } catch(e){
      console.error('Ekleme hatası', e);
      showToast('Geçersiz JSON veya ekleme sırasında bir hata oluştu', 'error');
      onNotify({ type: 'error', title: 'Ekleme', message: 'Kayıt eklenemedi' });
    }
  };

  const Section = ({ col, rows, title, subtitle, icon, grid }) => (
    <section className="db-card">
      <div className="db-card__header">
        <div className="db-title">
          {icon}
          <div className="db-title__text">
            <div className="db-title__main">{title}</div>
            <div className="db-title__sub">{subtitle.replace('{count}', filterRows(rows).length)}</div>
          </div>
        </div>
        <button className="btn-primary" onClick={()=>openAdd(col)}>
          <Plus size={16}/> Ekle
        </button>
      </div>
      <div className={`db-list ${grid ? 'db-list--grid' : ''}`}>
        {filterRows(rows).map(item => (
          <details key={item.id} className="db-item">
            <summary className="db-item__summary" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); openView(col, item); }}>
              {col === 'users' && (<>
                <span className="db-summary-strong">{item.name || 'İsimsiz'}</span>
                <span className="db-summary-muted">{item.email}</span>
                <span className="db-summary-muted">Rol: {item.role || 'user'}</span>
              </>)}
              {col === 'surveys' && (<>
                <span className="db-summary-strong">{item.title || 'Başlıksız'}</span>
                <span className="db-summary-muted">Kategori: {item.category || '-'}</span>
                <span className="db-summary-muted">{item.active ? 'Aktif' : 'Pasif'}</span>
              </>)}
              {col === 'categories' && (<>
                <span className="db-summary-strong">{item.name || '(adsız)'}</span>
              </>)}
            </summary>

          </details>
        ))}
      </div>
    </section>
  );

  return (
    <div className="users-tab" style={{padding:0}}>
      <div className="users-header">
        <div className="header-left">
          <Database size={24} />
          <div>
            <h2>Database</h2>
            <p>Firebase koleksiyonlarını görüntüleyin ve düzenleyin</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Ara..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={loadAll} disabled={loading}>
            <RefreshCw size={16} /> {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
        </div>
      </div>


      <div className="db-toasts">
        {toasts.map(t => (
          <div key={t.id} className={`db-toast db-toast--${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>


      <div className={"db-tabs db-tabs--center"}>
        <button className={`db-tab ${activeTab==='users' ? 'active' : ''}`} onClick={()=>setActiveTab('users')}>
          <Users size={16}/> Üyeler
        </button>
        <button className={`db-tab ${activeTab==='surveys' ? 'active' : ''}`} onClick={()=>setActiveTab('surveys')}>
          <FileText size={16}/> Anketler
        </button>
        <button className={`db-tab ${activeTab==='categories' ? 'active' : ''}`} onClick={()=>setActiveTab('categories')}>
          <Folder size={16}/> Kategoriler
        </button>
      </div>


      {activeTab !== null && (
        <div ref={dataScrollRef} className="db-scroll">
          {activeTab === 'users' && (
            <Section
              col="users"
              rows={users}
              title="Üyeler"
              subtitle="Toplam: {count}"
              icon={<Users size={18}/>} />
          )}
          {activeTab === 'surveys' && (
            <Section
              col="surveys"
              rows={surveys}
              title="Anketler"
              subtitle="Toplam: {count}"
              icon={<FileText size={18}/>} />
          )}
          {activeTab === 'categories' && (
            <Section
              col="categories"
              rows={categories}
              title="Kategoriler"
              subtitle="Toplam: {count}"
              icon={<Folder size={18}/>} grid />
          )}
        </div>
      )}


      {viewOpen && viewItem && (
        <div className="db-overlay" onMouseDown={closeView}>
          <div className="db-modal" onMouseDown={(e)=>e.stopPropagation()}>
            <div className="db-modal__header">
              <div className="db-modal__title">
                {viewCol === 'users' && (viewItem.name || 'Üye Detayı')}
                {viewCol === 'surveys' && (viewItem.title || 'Anket Detayı')}
                {viewCol === 'categories' && (viewItem.name || 'Kategori Detayı')}
              </div>
              <button className="btn-secondary" onClick={closeView}>Kapat</button>
            </div>
            {renderEditable(viewCol, viewItem)}
          </div>
        </div>
      )}

      {addOpen && (
        <div className="db-overlay" onMouseDown={closeAdd}>
          <div className="db-modal" onMouseDown={(e)=>e.stopPropagation()}>
            <div className="db-modal__header">
              <div className="db-modal__title">Yeni {addCol === 'users' ? 'Üye' : addCol === 'surveys' ? 'Anket' : 'Kategori'}</div>
              <button className="btn-secondary" onClick={closeAdd}>Kapat</button>
            </div>
            <textarea className="db-modal__textarea" value={addBuffer} onChange={(e)=>setAddBuffer(e.target.value)} />
            <div className="db-actions db-actions--end">
              <button className="btn-primary" onClick={saveAdd}>
                <Save size={16}/> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 