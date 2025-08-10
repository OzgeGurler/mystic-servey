import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import "../css/AdminPage.css";
import "../css/SurveysTab.css";

export default function SurveysTab({ mode = 'list', showTopBars = true, externalCreateCategory = '', createTrigger = 0, externalEditSurveyId = '', editTrigger = 0, onNotify = () => {}, settings = {}, externalSearch = '', externalFilters = { onlyActive:false }, refreshToken = 0 }) {
    const [surveys, setSurveys] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredSurveys, setFilteredSurveys] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editSurveyId, setEditSurveyId] = useState(null);
    const [editSelectedId, setEditSelectedId] = useState("");
    const [createSelectedCategory, setCreateSelectedCategory] = useState("");

    const defaultQuestionCount = settings?.surveys?.defaultQuestionCount ?? 1;
    const defaultActive = settings?.surveys?.defaultActive !== false;

    const [newSurvey, setNewSurvey] = useState({
        title: "",
        category: "",
        description: '',
        coverImage: '',
        questionCount: defaultQuestionCount,
        questions: [],
        results: [],
        popular: false,
    });

    useEffect(() => {
        fetchSurveys(); 
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchSurveys();
        fetchCategories();
    }, [refreshToken]);

    useEffect(() => {
        const byCategory = (selectedCategory === "Tümü"
                ? surveys
            : surveys.filter((s) => s.category === selectedCategory));
        const bySearch = byCategory.filter(s => {
            const q = (externalSearch || '').toLowerCase();
            if (!q) return true;
            return (
                s.title?.toLowerCase().includes(q)
                || s.description?.toLowerCase().includes(q)
                || s.category?.toLowerCase().includes(q)
                || s.id?.toLowerCase().includes(q)
            );
        });
        const byActive = externalFilters?.onlyActive ? bySearch.filter(s => !!s.active) : bySearch;
        setFilteredSurveys(byActive);
    }, [selectedCategory, surveys, externalSearch, externalFilters]);

    useEffect(() => {
        setShowModal(false);
        if (mode === 'create' || mode === 'edit') {
            setShowSelectModal(true);
        } else {
            setShowSelectModal(false);
        }
    }, [mode]);

    useEffect(() => {
        if (!externalCreateCategory) return;
        setIsEditMode(false);
        setNewSurvey({
            title: "",
            category: externalCreateCategory,
            description: '',
            coverImage: '',
            questionCount: defaultQuestionCount,
            questions: [
                { id: 1, question: "", options:["", ""], optionPoints:[0, 0], imageUrl: '' }
            ],
            results: [],
            popular: false,
        });
        setModalStep(1);
        setShowModal(true);
        setShowSelectModal(false);

    }, [createTrigger]);

    useEffect(() => {
        if (!externalEditSurveyId) return;
        const s = surveys.find(x => x.id === externalEditSurveyId);
        if (!s) return;
        setIsEditMode(true);
        setEditSurveyId(s.id);
        const { id, createdAt, active, ...surveyData } = s;
        setNewSurvey(surveyData);
        setModalStep(1);
        setShowModal(true);
        setShowSelectModal(false);

    }, [editTrigger]);

    const fetchSurveys = async () => {
        try {
            const snapshot = await getDocs(collection(db, "surveys"));
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSurveys(data);
        } catch (err) {
            console.error("Anketler yüklenemedi:", err);
            onNotify({ type: 'error', title: 'Anketler', message: 'Anketler yüklenemedi' });
        }
    };

    const fetchCategories = async () => {
        try {
            const catSnapshot = await getDocs(collection(db, "categories"));
            const firestoreCategories = catSnapshot.docs.map((doc) => doc.data().name);
            const surveyCategories = [...new Set(surveys.map((s) => s.category))];
            const allCategories = Array.from(new Set([
                ...firestoreCategories,
                ...surveyCategories
            ])).filter((cat) => cat && cat.trim() !== "");
            setCategories(allCategories);
        } catch (err) {
            console.error("Kategoriler yüklenemedi:", err);
            onNotify({ type: 'error', title: 'Kategoriler', message: 'Kategoriler yüklenemedi' });
        }
    };

    const addCategoryIfNotExists = async (name) => {
        if (!categories.includes(name)) {
            await addDoc(collection(db, "categories"), { name });
            fetchCategories();
        }
    };

    const addNewCategory = async () => {
        if (!newCategoryName.trim()) {
            onNotify({ type: 'error', title: 'Kategori', message: 'Kategori adı boş olamaz' });
            return;
        }
        if (categories.includes(newCategoryName.trim())) {
            onNotify({ type: 'info', title: 'Kategori', message: 'Bu kategori zaten mevcut' });
            return;
        }
        try {
            await addDoc(collection(db, "categories"), { name: newCategoryName.trim() });
            fetchCategories();
            setNewCategoryName("");
            onNotify({ type: 'success', title: 'Kategori', message: 'Kategori eklendi' });
        } catch (err) {
            console.error("Kategori eklenemedi:", err);
            onNotify({ type: 'error', title: 'Kategori', message: 'Kategori eklenemedi' });
        }
    };

    const deleteCategoryByName = async (name) => {
        if (!name) return;
        const inUse = surveys.some(s => s.category === name);
        if (inUse) {
            onNotify({ type: 'error', title: 'Kategori', message: 'Kategori kullanımda, önce anketleri güncelleyin' });
            return;
        }
        try {
            const catSnapshot = await getDocs(collection(db, "categories"));
            const catDoc = catSnapshot.docs.find((doc) => doc.data().name === name);
            if (catDoc) {
                await deleteDoc(doc(db, "categories", catDoc.id));
                fetchCategories();
                onNotify({ type: 'success', title: 'Kategori', message: 'Kategori silindi' });
            }
        } catch (err) {
            console.error("Kategori silinemedi:", err);
            onNotify({ type: 'error', title: 'Kategori', message: 'Kategori silinemedi' });
        }
    };

    const toggleSurveyStatus = async (id) => {
        try {
            const survey = surveys.find((s) => s.id === id);
            await updateDoc(doc(db, "surveys", id), { active: !survey.active });
            setSurveys((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
            onNotify({ type: 'success', title: 'Anket', message: `Anket ${!survey.active ? 'aktif' : 'pasif'} yapıldı` });
        } catch (err) {
            console.error("Durum güncellenemedi:", err);
            onNotify({ type: 'error', title: 'Anket', message: 'Durum güncellenemedi' });
        }
    };

    const toggleSurveyPopular = async (id) => {
        try {
            const survey = surveys.find((s) => s.id === id);
            const next = !survey?.popular;
            await updateDoc(doc(db, 'surveys', id), { popular: next });
            setSurveys(prev => prev.map(s => s.id === id ? { ...s, popular: next } : s));
            onNotify({ type: 'success', title: 'Anket', message: `Anket ${next ? 'popüler' : 'popüler değil'} olarak işaretlendi` });
        } catch (err) {
            console.error('Popüler güncellenemedi:', err);
            onNotify({ type: 'error', title: 'Anket', message: 'Popüler durumu güncellenemedi' });
        }
    };

    const deleteSurvey = async (id) => {
        if (!window.confirm("Anketi silmek istediğinize emin misiniz?")) return;
        try {
            const updated = surveys.filter((s) => s.id !== id);
            await deleteDoc(doc(db, "surveys", id));
            setSurveys(updated);
            onNotify({ type: 'success', title: 'Anket', message: 'Anket silindi' });
        } catch (err) {
            console.error("Anket silinemedi:", err);
            onNotify({ type: 'error', title: 'Anket', message: 'Silme başarısız' });
        }
    };

    const resetModal = () => {
        setNewSurvey({
            title: "",
            category: "",
            description: '',
            coverImage: '',
            questionCount: defaultQuestionCount,
            questions: [
                { id: 1, question: "", options: ["", ""], optionPoints: [0, 0], imageUrl: '' },
            ],
            results: [],
            popular: false,
        });
        setIsEditMode(false);
        setEditSurveyId(null);
        setModalStep(1);
        setShowModal(false);
    };

    const handleStep1Next = () => {
        if (!newSurvey.title.trim() || !newSurvey.category.trim()) {
            onNotify({ type: 'error', title: 'Anket', message: 'Başlık ve kategori zorunludur' });
            return;
        }
        if (!isEditMode) {
            const questionCount = newSurvey.questionCount;
            const questions = Array.from({ length: questionCount }, (_, i) => ({ id: i + 1, question: "", options: ["", ""], optionPoints: [0, 0], imageUrl: '' }));
            setNewSurvey((prev) => ({ ...prev, questions }));
        }
        setModalStep(2);
    };

    const handleStep2Next = () => {
        // Allow progressing; enforce structure minimally (at least 2 options per question)
        const invalidStructure = newSurvey.questions.some((q) => (q.options || []).length < 2);
        if (invalidStructure) {
            onNotify({ type: 'error', title: 'Anket', message: 'Her soru için en az 2 seçenek olmalı' });
            return;
        }
        setModalStep(3);
    };

    const checkResultOverlap = () => {
        const ranges = newSurvey.results.map((r) => [r.min, r.max]);
        return ranges.some(([min1, max1], i) => ranges.some(([min2, max2], j) => i !== j && min1 <= max2 && max1 >= min2));
    };

    const saveSurvey = async () => {
        // Normalize data before save so creation is resilient
        const cleanedQuestions = (newSurvey.questions || []).map((q, idx) => ({
            id: q.id ?? idx + 1,
            question: (q.question || "").trim(),
            options: (q.options || []).map((o) => (o || "").trim()),
            optionPoints: (q.optionPoints || []).map((p) => parseInt(p, 10) || 0),
            imageUrl: (q.imageUrl || "").trim(),
        }));

        // Ensure at least one question with two options
        const ensuredQuestions = cleanedQuestions.length
            ? cleanedQuestions
            : [{ id: 1, question: "", options: ["", ""], optionPoints: [0, 0], imageUrl: "" }];

        // Results: make safe numbers and ensure at least one default range
        let safeResults = (newSurvey.results || []).map((r) => ({
            min: Number.isFinite(parseInt(r.min, 10)) ? parseInt(r.min, 10) : 0,
            max: Number.isFinite(parseInt(r.max, 10)) ? parseInt(r.max, 10) : 0,
            resultText: (r.resultText || "").trim(),
            imageUrl: (r.imageUrl || "").trim(),
        }));

        // Filter out completely empty rows
        safeResults = safeResults.filter((r) => r.resultText || r.min !== 0 || r.max !== 0 || r.imageUrl);

        // If user didn't add any result, create a default bucket to allow creation
        if (safeResults.length === 0) {
            safeResults = [{ min: 0, max: 0, resultText: "Sonuç", imageUrl: "" }];
            onNotify({ type: 'info', title: 'Anket', message: 'Sonuç aralığı eklenmedi, varsayılan bir aralık oluşturuldu' });
        }

        // Fix min/max ordering and resolve overlaps by sorting
        safeResults = safeResults.map((r) => ({ ...r, min: Math.min(r.min, r.max), max: Math.max(r.min, r.max) }))
            .sort((a, b) => a.min - b.min)
            .reduce((acc, curr) => {
                const prev = acc[acc.length - 1];
                if (prev && curr.min <= prev.max) {
                    // Merge overlapping ranges by extending previous max
                    prev.max = Math.max(prev.max, curr.max);
                    if (!prev.resultText && curr.resultText) prev.resultText = curr.resultText;
                } else {
                    acc.push({ ...curr });
                }
                return acc;
            }, []);

        const payload = {
            title: (newSurvey.title || '').trim(),
            category: (newSurvey.category || '').trim(),
            description: (newSurvey.description || '').trim(),
            coverImage: (newSurvey.coverImage || '').trim(),
            questionCount: ensuredQuestions.length,
            questions: ensuredQuestions,
            results: safeResults,
            popular: !!newSurvey.popular,
        };

        if (!payload.title || !payload.category) {
            onNotify({ type: 'error', title: 'Anket', message: 'Başlık ve kategori zorunludur' });
            return;
        }

        try {
            await addCategoryIfNotExists(payload.category);
            if (isEditMode && editSurveyId) {
                await updateDoc(doc(db, "surveys", editSurveyId), payload);
                setSurveys((prev) => prev.map((s) => (s.id === editSurveyId ? { ...s, ...payload } : s)));
                onNotify({ type: 'success', title: 'Anket', message: 'Anket güncellendi' });
            } else {
                const data = { ...payload, active: defaultActive, createdAt: new Date().toISOString() };
                const docRef = await addDoc(collection(db, "surveys"), data);
                setSurveys((prev) => [...prev, { id: docRef.id, ...data }]);
                onNotify({ type: 'success', title: 'Anket', message: 'Anket kaydedildi' });
            }
            setShowModal(false);
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            onNotify({ type: 'error', title: 'Anket', message: 'Anket kaydedilemedi' });
        }
    };

    const updateQuestionField = (qIdx, field, value) => {
        const updated = [...newSurvey.questions];
        updated[qIdx][field] = value;
        setNewSurvey((prev) => ({ ...prev, questions: updated }));
    };

    const updateOptionField = (qIdx, oIdx, value) => {
        const updated = [...newSurvey.questions];
        updated[qIdx].options[oIdx] = value;
        setNewSurvey((prev) => ({ ...prev, questions: updated }));
    };

    const updateOptionPoint = (qIdx, oIdx, value) => {
        const updated = [...newSurvey.questions];
        updated[qIdx].optionPoints[oIdx] = parseInt(value) || 0;
        setNewSurvey((prev) => ({ ...prev, questions: updated }));
    };

    const addOption = (qIdx) => {
        const updated = [...newSurvey.questions];
        updated[qIdx].options.push("");
        updated[qIdx].optionPoints.push(0);
        setNewSurvey((prev) => ({ ...prev, questions: updated }));
    };

    const removeOption = (qIdx, oIdx) => {
        const updated = [...newSurvey.questions];
        if (updated[qIdx].options.length > 2) {
            updated[qIdx].options.splice(oIdx, 1);
            updated[qIdx].optionPoints.splice(oIdx, 1);
            setNewSurvey((prev) => ({ ...prev, questions: updated }));
        }
    };

    const addResultRange = () => {
        setNewSurvey((prev) => ({ ...prev, results: [...prev.results, { min: 0, max: 0, resultText: "", imageUrl: '' }] }));
    };

    const updateResultRange = (idx, field, value) => {
        const updated = [...newSurvey.results];
        updated[idx][field] = field === "resultText" || field === 'imageUrl' ? value : parseInt(value) || 0;
        setNewSurvey((prev) => ({ ...prev, results: updated }));
    };

    const removeResultRange = (idx) => {
        const updated = [...newSurvey.results];
        updated.splice(idx, 1);
        setNewSurvey((prev) => ({ ...prev, results: updated }));
    };

    const openEditSelected = () => {
        const s = surveys.find(sv => sv.id === editSelectedId);
        if (!s) {
            onNotify({ type: 'error', title: 'Anket', message: 'Düzenlemek için bir anket seçin' });
            return;
        }
        setIsEditMode(true);
        setEditSurveyId(s.id);
        const { id, createdAt, active, ...surveyData } = s;
        setNewSurvey(surveyData);
        setModalStep(1);
        setShowModal(true);
        setShowSelectModal(false);
    };

    const openCreateFromSelection = () => {
        if (!createSelectedCategory) {
            onNotify({ type: 'error', title: 'Anket', message: 'Lütfen bir kategori seçin' });
            return;
        }
        // Fresh survey state with selected category and initial question
        setIsEditMode(false);
        setEditSurveyId(null);
        setModalStep(1);
        setNewSurvey({
            title: "",
            category: createSelectedCategory,
            description: "",
            coverImage: "",
            questionCount: defaultQuestionCount,
            questions: [
                { id: 1, question: "", options: ["", ""], optionPoints: [0, 0], imageUrl: "" },
            ],
            results: [],
            popular: false,
        });
        setShowModal(true);
        setShowSelectModal(false);
    };

    const renderListView = () => (
        <div className="tab-content">
            <div className="users-header" style={{paddingLeft:0,paddingRight:0, marginBottom:16}}>
                <div className="header-left">
                    <div>
            <h2>Anket Yönetimi</h2>
                        <p>Platformdaki anketleri görüntüleyin ve yönetin</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setShowCategoryModal(true)}>Kategoriler</button>
                    {(mode === 'create' || mode === 'edit') && (
                        <button className="btn-primary" onClick={()=>setShowSelectModal(true)}>Seçim Penceresini Aç</button>
                    )}
                </div>
            </div>

            <div className="filter-container" style={{background:'transparent', border:'1px solid #1f1f1f', color:'#c9d1d9'}}>
                <label style={{color:'#c9d1d9'}}>Kategori:</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{background:'#151922', color:'#e5e7eb', border: '1px solid #222838'}}
                >
                    <option value="Tümü">Tümü</option>
                    {categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <table className="surveys-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Başlık</th>
                        <th>Kategori</th>
                        <th>Soru Sayısı</th>
                        <th>Durum</th>
                        <th>Popüler</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSurveys.map((s) => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.title}</td>
                            <td>{s.category}</td>
                            <td>{s.questionCount}</td>
                            <td>
                                <span className={s.active ? "survey-status active" : "survey-status inactive"}>
                                    {s.active ? "Aktif" : "Pasif"}
                                </span>
                            </td>
                            <td>
                                <button className={`status-btn ${s.popular ? 'active' : 'inactive'}`} onClick={() => toggleSurveyPopular(s.id)}>
                                    {s.popular ? 'Popüler' : 'Değil'}
                                </button>
                            </td>
                            <td>
                                <button className={`status-btn ${s.active ? "active" : "inactive"}`} onClick={() => toggleSurveyStatus(s.id)}>
                                    {s.active ? "Pasif Yap" : "Aktif Yap"}
                                </button>
                                <button className="delete-btn" onClick={() => deleteSurvey(s.id)}>Sil</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {renderSurveyModal()}
            {renderCategoryModal()}
            {renderSelectModal()}
        </div>
    );

    const renderSurveyModal = () => (
        showModal && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                        <h2>{isEditMode ? "Anketi Düzenle" : `Yeni Anket - Adım ${modalStep}/3`}</h2>
                        <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        {modalStep === 1 && (
                            <div className="modal-form">
                                <label>Başlık</label>
                            <input type="text" value={newSurvey.title} onChange={(e) => setNewSurvey((prev) => ({ ...prev, title: e.target.value }))} placeholder="Anket başlığı" />
                                <label>Açıklama</label>
                            <input type="text" value={newSurvey.description} onChange={(e) => setNewSurvey((prev) => ({ ...prev, description: e.target.value }))} placeholder="Anket açıklaması" />
                            <label>Kapak Görseli URL</label>
                            <input type="text" value={newSurvey.coverImage || ''} onChange={(e) => setNewSurvey(prev => ({...prev, coverImage: e.target.value}))} placeholder="https://..." />
                                <label>Kategori</label>
                            <select value={newSurvey.category} onChange={(e) => setNewSurvey((prev) => ({ ...prev, category: e.target.value }))}>
                                    <option value="">Kategori Seçiniz</option>
                                {categories.map((cat, i) => (<option key={i} value={cat}>{cat}</option>))}
                                </select>
                                <label>Soru Sayısı</label>
                            <input type="number" min="1" max="20" value={newSurvey.questionCount} onChange={(e) => setNewSurvey((prev) => ({ ...prev, questionCount: parseInt(e.target.value) || defaultQuestionCount }))} />
                            </div>
                        )}
                        {modalStep === 2 && (
                            <div className="modal-form">
                                <h3>Sorular ve Seçenekler</h3>
                                {newSurvey.questions.map((q, qIdx) => (
                                    <div key={qIdx} className="question-item">
                                        <div className="question-header">
                                            <h4>Soru {qIdx + 1}</h4>
                                        <button onClick={() => {
                                            if (newSurvey.questions.length <= 1) { onNotify({ type: 'error', title: 'Anket', message: 'En az 1 soru olmalı' }); return; }
                                                    if (window.confirm("Bu soruyu silmek istediğine emin misin?")) {
                                                        const updatedQuestions = [...newSurvey.questions];
                                                updatedQuestions.splice(qIdx, 1);
                                                setNewSurvey((prev) => ({ ...prev, questions: updatedQuestions, questionCount: prev.questionCount - 1 }));
                                            }
                                        }} className={`remove-question-btn ${newSurvey.questions.length <= 1 ? "disabled" : ""}`} disabled={newSurvey.questions.length <= 1}>❌ Soruyu Sil</button>
                                    </div>
                                    <input type="text" placeholder={`Soru ${qIdx + 1}`} value={q.question} onChange={(e) => updateQuestionField(qIdx, "question", e.target.value)} />
                                    <label>Görsel URL</label>
                                    <input type="text" placeholder="https://..." value={q.imageUrl || ''} onChange={(e)=>updateQuestionField(qIdx, 'imageUrl', e.target.value)} />
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="option-item">
                                            <input type="text" placeholder={`Seçenek ${oIdx + 1}`} value={opt} onChange={(e) => updateOptionField(qIdx, oIdx, e.target.value)} />
                                            <input type="number" min="0" value={q.optionPoints[oIdx]} onChange={(e) => updateOptionPoint(qIdx, oIdx, e.target.value)} placeholder="Puan" />
                                            {q.options.length > 2 && (<button onClick={() => removeOption(qIdx, oIdx)} className="remove-option-btn">×</button>)}
                                            </div>
                                        ))}
                                    <button onClick={() => addOption(qIdx)} className="add-option-btn">+ Seçenek Ekle</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {modalStep === 3 && (
                            <div className="modal-form">
                                <h3>Puan Aralıkları ve Sonuçlar</h3>
                                {newSurvey.results.map((res, idx) => (
                                    <div key={idx} className="result-item">
                                    <input type="number" value={res.min} onChange={(e) => updateResultRange(idx, "min", e.target.value)} placeholder="Min Puan" />
                                    <input type="number" value={res.max} onChange={(e) => updateResultRange(idx, "max", e.target.value)} placeholder="Max Puan" />
                                    <input type="text" value={res.resultText} onChange={(e) => updateResultRange(idx, "resultText", e.target.value)} placeholder="Sonuç Metni" />
                                    <input type="text" value={res.imageUrl || ''} onChange={(e)=>updateResultRange(idx, 'imageUrl', e.target.value)} placeholder="Sonuç Görseli URL" />
                                    <button onClick={() => removeResultRange(idx)} className="remove-result-btn">×</button>
                                    </div>
                                ))}
                            <button onClick={addResultRange} className="add-result-btn">+ Sonuç Ekle</button>
                        </div>
                    )}
                    <div className="modal-actions">
                        {modalStep > 1 && (<button onClick={() => setModalStep(modalStep - 1)} className="back-btn">Geri</button>)}
                        {modalStep < 3 && (<button onClick={modalStep === 1 ? handleStep1Next : handleStep2Next} className="next-btn">İleri</button>)}
                        {modalStep === 3 && (<button onClick={saveSurvey} className="save-btn">{isEditMode ? "Güncelle" : "Kaydet"}</button>)}
                        <button onClick={() => setShowModal(false)} className="cancel-btn">Kapat</button>
                    </div>
                </div>
            </div>
        )
    );

    const renderSelectModal = () => (
        showSelectModal && (mode === 'create' || mode === 'edit') && (
            <div className="modal-overlay" onMouseDown={()=>setShowSelectModal(false)}>
                <div className="modal-content" onMouseDown={(e)=>e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{mode === 'create' ? 'Anket Ekle' : 'Anket Düzenle'}</h2>
                        <button className="close-btn" onClick={()=>setShowSelectModal(false)}>×</button>
                            </div>
                    <div className="modal-form">
                        {mode === 'create' ? (
                            <>
                                <label>Kategori seç:</label>
                                <select value={createSelectedCategory} onChange={(e) => setCreateSelectedCategory(e.target.value)}>
                                    <option value="">Seçiniz</option>
                                    {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                                </select>
                            </>
                        ) : (
                            <>
                                <label>Düzenlenecek anket:</label>
                                <select value={editSelectedId} onChange={(e) => setEditSelectedId(e.target.value)}>
                                    <option value="">Seçiniz</option>
                                    {surveys.map(s => (<option key={s.id} value={s.id}>{s.title}</option>))}
                                </select>
                            </>
                        )}
                    </div>
                    <div className="modal-actions" style={{justifyContent:'flex-end'}}>
                        {mode === 'create' ? (
                            <button className="btn-primary" onClick={openCreateFromSelection} disabled={!createSelectedCategory}>Oluşturmayı Aç</button>
                        ) : (
                            <button className="btn-primary" onClick={openEditSelected} disabled={!editSelectedId}>Düzenlemeyi Aç</button>
                        )}
                    </div>
                </div>
            </div>
        )
    );

    const renderCategoryModal = () => (
        showCategoryModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h2>Kategoriler</h2>
                        <button className="close-btn" onClick={() => setShowCategoryModal(false)}>×</button>
                        </div>
                        <div className="modal-form">
                        <div className="category-modern">
                            <div className="category-add">
                                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Yeni kategori adı" />
                                <button onClick={addNewCategory} className="btn-primary">Ekle</button>
                                </div>
                            <div className="category-chips">
                                {categories.map((cat) => (
                                    <span key={cat} className="chip">{cat}<button className="chip-remove" title="Sil" onClick={() => deleteCategoryByName(cat)}>×</button></span>
                                ))}
                            </div>
                        </div>
                        </div>
                    <div className="modal-actions" style={{justifyContent:'flex-end'}}>
                        <button onClick={() => setShowCategoryModal(false)} className="btn-secondary">Kapat</button>
                    </div>
                </div>
        </div>
        )
    );

    return renderListView();
}