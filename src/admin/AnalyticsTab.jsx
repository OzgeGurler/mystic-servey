import React, { useEffect, useMemo, useState } from 'react';
import { Users as UsersIcon, FileText } from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import '../css/AdminPage.css';
import '../css/DatabaseTab.css';

export default function AnalyticsTab({ settings = {}, onNotify = () => {} }) {
  const [view, setView] = useState(null);
  const [users, setUsers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const showAnswers = settings?.analytics?.showAnswers !== false;
  const showResults = settings?.analytics?.showResults !== false;
  const showUserEmails = settings?.analytics?.showUserEmails !== false;
  const maxItems = settings?.analytics?.maxItems ?? 100;

  const loadAll = async () => {
    try {
      setLoading(true);
      const [usersSnap, surveysSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'surveys')),
      ]);
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSurveys(surveysSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Analytics load error', e);
      onNotify({ type: 'error', title: 'Analiz', message: 'Veriler yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);


  const surveyById = useMemo(() => {
    const map = new Map();
    surveys.forEach(s => map.set(String(s.id), s));
    return map;
  }, [surveys]);

  const computeUserSurveyResult = (survey, answersArr) => {
    if (!survey || !Array.isArray(answersArr)) return null;
    let totalPoints = 0;
    answersArr.forEach(({ questionIndex, optionIndex }) => {
      const q = survey.questions?.[questionIndex];
      if (q) {
        const pts = q.optionPoints?.[optionIndex] ?? 0;
        totalPoints += Number(pts) || 0;
      }
    });
    let resultText = null;
    if (Array.isArray(survey.results)) {
      for (const r of survey.results) {
        if (totalPoints >= r.min && totalPoints <= r.max) {
          resultText = r.resultText;
          break;
        }
      }
    }
    return { totalPoints, resultText };
  };

  const formatDate = (val) => {
    if (!val) return '-';
    const d = val?.toDate ? val.toDate() : new Date(val);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('tr-TR');
  };

  const percent = (count, total) => {
    if (!total || total <= 0) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };


  const usersSummaries = useMemo(() => {
    return users.slice(0, maxItems).map(u => {
      const ua = Array.isArray(u.userAnswers) ? u.userAnswers : [];
      return { user: u, completedCount: ua.length };
    });
  }, [users, maxItems]);

  const openUserModal = (u) => {
    setSelectedUser(u);
    setUserModalOpen(true);
  };
  const closeUserModal = () => { setUserModalOpen(false); setSelectedUser(null); };


  const surveyAgg = useMemo(() => {
    const agg = surveys.slice(0, maxItems).map(s => ({
      survey: s,
      participants: 0,
      questionOptionCounts: [],
      resultCounts: new Map(),
    }));
    const idToAgg = new Map(agg.map(x => [String(x.survey.id), x]));

    users.forEach(u => {
      const ua = Array.isArray(u.userAnswers) ? u.userAnswers : [];
      ua.forEach(entry => {
        const sid = String(entry.surveyId);
        const a = idToAgg.get(sid);
        if (!a) return;
        a.participants += 1;
        const answersArr = entry.answers || [];
        if (a.questionOptionCounts.length === 0) {
          a.questionOptionCounts = (a.survey.questions || []).map(q => ({
            question: q.question,
            options: (q.options || []).map(() => 0)
          }));
        }
        answersArr.forEach(({ questionIndex, optionIndex }) => {
          if (a.questionOptionCounts[questionIndex] && a.questionOptionCounts[questionIndex].options[optionIndex] != null) {
            a.questionOptionCounts[questionIndex].options[optionIndex] += 1;
          }
        });
        const comp = computeUserSurveyResult(a.survey, answersArr);
        const key = comp?.resultText || '(sonuçsuz)';
        a.resultCounts.set(key, (a.resultCounts.get(key) || 0) + 1);
      });
    });

    return agg;
  }, [surveys, users, maxItems]);

  const TopTabs = () => (
    <div className={'db-tabs db-tabs--center'} style={{marginBottom:12}}>
      <button className={`db-tab ${view==='users' ? 'active' : ''}`} onClick={()=>setView('users')}><UsersIcon size={16}/> Kullanıcılar</button>
      <button className={`db-tab ${view==='surveys' ? 'active' : ''}`} onClick={()=>setView('surveys')}><FileText size={16}/> Anketler</button>
    </div>
  );

  const Picker = () => (
    <div className="tab-content" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'40vh'}}>
      <div className="analytics-picker" style={{display:'grid', gridTemplateColumns:'repeat(2, 160px)', gap:16}}>
        <button className="analytics-button-square" onClick={()=>setView('users')} style={squareBtnStyle}>
          <UsersIcon size={28} />
          <div style={{marginTop:8}}>Kullanıcılar</div>
        </button>
        <button className="analytics-button-square" onClick={()=>setView('surveys')} style={squareBtnStyle}>
          <FileText size={28} />
          <div style={{marginTop:8}}>Anketler</div>
        </button>
      </div>
    </div>
  );

  const squareBtnStyle = {
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    background:'#151922', border:'1px solid #222838', color:'#e5e7eb', borderRadius:12, padding:20,
    width:160, height:160, cursor:'pointer'
  };

  const UsersView = () => (
    <div className="tab-content">
      <TopTabs />
      <div className="users-header" style={{paddingLeft:0,paddingRight:0, marginBottom:16}}>
        <div className="header-left">
          <div>
            <h2>Kullanıcı Analizi</h2>
            <p>Kullanıcıları listeleyin, detayları pencerede görüntüleyin</p>
          </div>
        </div>
      </div>
      {loading && <div>Yükleniyor...</div>}
      {!loading && (
        <div className="settings-card" style={{padding:0}}>
          <div className="table-grid-header" style={{display:'grid', gridTemplateColumns:'2fr 2fr 1fr', gap:0, padding:'12px 16px', borderBottom:'1px solid #1f1f1f'}}>
            <div>Ad Soyad</div>
            <div>Email</div>
            <div>Çözülen Anket</div>
          </div>
          <div>
            {usersSummaries.map(({ user, completedCount }) => (
              <button
                key={user.id}
                onClick={()=>openUserModal(user)}
                style={{display:'grid', gridTemplateColumns:'2fr 2fr 1fr', width:'100%', textAlign:'left', padding:'12px 16px', background:'transparent', border:'none', borderBottom:'1px solid #1f1f1f', color:'#e5e7eb', cursor:'pointer'}}
              >
                <div style={{color:'#fff'}}>{user.name || 'İsimsiz'}</div>
                <div style={{color:'#9ca3af'}}>{showUserEmails ? (user.email || '-') : '-'}</div>
                <div style={{fontWeight:600}}>{completedCount}</div>
              </button>
            ))}
            {usersSummaries.length === 0 && (
              <div style={{padding:'12px 16px', color:'#9ca3af'}}>Kullanıcı bulunamadı</div>
            )}
          </div>
        </div>
      )}

      {userModalOpen && selectedUser && (
        <div className="db-overlay" onMouseDown={closeUserModal}>
          <div className="db-modal" onMouseDown={(e)=>e.stopPropagation()}>
            <div className="db-modal__header">
              <div className="db-modal__title">
                {selectedUser.name || 'Kullanıcı Detayı'}
                {showUserEmails && selectedUser.email ? ` • ${selectedUser.email}` : ''}
              </div>
              <button className="btn-secondary" onClick={closeUserModal}>Kapat</button>
            </div>
            <div style={{padding:'8px'}}>
              {(() => {
                const ua = Array.isArray(selectedUser.userAnswers) ? selectedUser.userAnswers : [];
                if (ua.length === 0) {
                  return <div style={{color:'#9ca3af'}}>Bu kullanıcı henüz anket çözmemiş.</div>;
                }
                return ua.map((entry, idx) => {
                  const survey = surveyById.get(String(entry.surveyId));
                  const comp = computeUserSurveyResult(survey, entry.answers || []);
                  return (
                    <div key={idx} className="settings-card" style={{marginBottom:12}}>
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div style={{fontWeight:700}}>{survey?.title || `Anket ${entry.surveyId}`}</div>
                        {showResults && (
                          <div style={{display:'flex', gap:12, color:'#93c5fd'}}>
                            <span>Sonuç: <strong>{comp?.resultText || '-'}</strong></span>
                            <span>Toplam Puan: <strong>{comp?.totalPoints ?? '-'}</strong></span>
                          </div>
                        )}
                      </div>
                      {showAnswers && (
                        <div style={{marginTop:8}}>
                          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 120px', padding:'8px 10px', border:'1px solid #222838', borderRadius:8, background:'#151922', color:'#c9d1d9', fontWeight:600}}>
                            <div>Soru</div>
                            <div>Seçilen Cevap</div>
                            <div style={{textAlign:'right'}}>Puan</div>
                          </div>
                          {(survey?.questions || []).map((q, qi) => {
                            const ans = (entry.answers || []).find(a => a.questionIndex === qi);
                            const optLabel = ans ? (q.options?.[ans.optionIndex] ?? `Seçenek ${ans.optionIndex}`) : '-';
                            const optPoint = ans ? (q.optionPoints?.[ans.optionIndex] ?? 0) : 0;
                            return (
                              <div key={qi} style={{display:'grid', gridTemplateColumns:'1fr 1fr 120px', padding:'8px 10px', border:'1px solid #1f1f1f', borderTop:'none', color:'#e5e7eb'}}>
                                <div>{q.question}</div>
                                <div>{optLabel}</div>
                                <div style={{textAlign:'right'}}>{optPoint}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SurveysView = () => (
    <div className="tab-content">
      <TopTabs />
      <div className="users-header" style={{paddingLeft:0,paddingRight:0, marginBottom:16}}>
        <div className="header-left">
          <div>
            <h2>Anket Analizi</h2>
            <p>Anket başına katılımcı sayısı, seçenek ve sonuç dağılımları</p>
          </div>
        </div>
      </div>
      {loading && <div>Yükleniyor...</div>}
      {!loading && surveyAgg.map(a => (
        <div key={a.survey.id} className="settings-card" style={{marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
            <div style={{fontWeight:600}}>{a.survey.title || a.survey.id}</div>
            <div style={{display:'flex', gap:12, color:'#93c5fd'}}>
              <span>Katılımcı: <strong>{a.participants}</strong></span>
              {a.survey.category && <span>Kategori: <strong>{a.survey.category}</strong></span>}
              {a.survey.createdAt && <span>Oluşturma: <strong>{formatDate(a.survey.createdAt)}</strong></span>}
              {typeof a.survey.avarageRating !== 'undefined' && (
                <span>Puan: <strong>{a.survey.avarageRating}</strong> ({a.survey.ratingCount || 0})</span>
              )}
            </div>
          </div>

          <div style={{marginTop:8, display:'grid', gap:10}}>
            {(a.questionOptionCounts || []).map((q, qi) => (
              <div key={qi}>
                <div style={{fontWeight:600, marginBottom:4}}>Soru {qi+1}: {q.question}</div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:8}}>
                  {(a.survey.questions?.[qi]?.options || q.options.map((_, idx) => `Seçenek ${idx+1}`)).map((label, oi) => {
                    const cnt = q.options[oi] ?? 0;
                    return (
                      <div key={oi} style={{background:'#151922', border:'1px solid #222838', borderRadius:10, padding:'8px 10px'}}>
                        <div style={{color:'#c9d1d9'}}>{label}</div>
                        <div style={{color:'#e5e7eb', fontWeight:700}}>{cnt} <span style={{color:'#9ca3af', fontWeight:500}}>({percent(cnt, a.participants)})</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:10}}>
            <div style={{fontWeight:600, marginBottom:4}}>Sonuç Dağılımı</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:8}}>
              {[...a.resultCounts.entries()].map(([key, cnt]) => (
                <div key={key} style={{background:'#151922', border:'1px solid #222838', borderRadius:10, padding:'8px 10px'}}>
                  <div style={{color:'#c9d1d9'}}>{key}</div>
                  <div style={{color:'#e5e7eb', fontWeight:700}}>{cnt} <span style={{color:'#9ca3af', fontWeight:500}}>({percent(cnt, a.participants)})</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!view) return <Picker />;
  if (view === 'users') return <UsersView />;
  return <SurveysView />;
} 