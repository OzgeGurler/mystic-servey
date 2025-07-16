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

export default function SurveysTab() {
    const [surveys, setSurveys] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredSurveys, setFilteredSurveys] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Tümü");

    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editSurveyId, setEditSurveyId] = useState(null);

    const [newSurvey, setNewSurvey] = useState({
        title: "",
        category: "",
        questionCount: 1,
        questions: [],
        results: [],
    });

    useEffect(() => {
        fetchSurveys();
        fetchCategories();
    }, []);

    useEffect(() => {
        setFilteredSurveys(
            selectedCategory === "Tümü"
                ? surveys
                : surveys.filter((s) => s.category === selectedCategory)
        );
    }, [selectedCategory, surveys]);

    const fetchSurveys = async () => {
        try {
            const snapshot = await getDocs(collection(db, "surveys"));
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSurveys(data);
        } catch (err) {
            console.error("Anketler yüklenemedi:", err);
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
        }
    };

    const addCategoryIfNotExists = async (name) => {
        if (!categories.includes(name)) {
            await addDoc(collection(db, "categories"), { name });
            fetchCategories();
        }
    };

    const toggleSurveyStatus = async (id) => {
        try {
            const survey = surveys.find((s) => s.id === id);
            await updateDoc(doc(db, "surveys", id), { active: !survey.active });
            setSurveys((prev) =>
                prev.map((s) =>
                    s.id === id ? { ...s, active: !s.active } : s
                )
            );
        } catch (err) {
            console.error("Durum güncellenemedi:", err);
        }
    };

    const deleteSurvey = async (id) => {
        if (!window.confirm("Anketi silmek istediğinize emin misiniz?")) return;
        try {
            const survey = surveys.find((s) => s.id === id);
            await deleteDoc(doc(db, "surveys", id));
            const updated = surveys.filter((s) => s.id !== id);
            setSurveys(updated);

            const categoryStillUsed = updated.some((s) => s.category === survey.category);
            if (!categoryStillUsed) {
                const catSnapshot = await getDocs(collection(db, "categories"));
                const catDoc = catSnapshot.docs.find((doc) => doc.data().name === survey.category);
                if (catDoc) {
                    await deleteDoc(doc(db, "categories", catDoc.id));
                    fetchCategories();
                }
            }
        } catch (err) {
            console.error("Anket silinemedi:", err);
        }
    };

    const resetModal = () => {
        setNewSurvey({
            title: "",
            category: "",
            questionCount: 1,
            questions: [
                {
                    id: 1,
                    question: "",
                    options: ["", ""],
                    optionPoints: [0, 0],
                },
            ],
            results: [],
        });
        setIsEditMode(false);
        setEditSurveyId(null);
        setModalStep(1);
        setShowModal(false);
    };

    const handleStep1Next = () => {
        if (!newSurvey.title.trim() || !newSurvey.category.trim()) {
            alert("Başlık ve kategori zorunludur!");
            return;
        }

        if (!isEditMode) {
            const questionCount = newSurvey.questionCount;
            const questions = Array.from({ length: questionCount }, (_, i) => ({
                id: i + 1,
                question: "",
                options: ["", ""],
                optionPoints: [0, 0],
            }));

            setNewSurvey((prev) => ({
                ...prev,
                questions,
            }));
        }

        setModalStep(2);
    };

    const handleStep2Next = () => {
        const invalid = newSurvey.questions.some(
            (q) =>
                !q.question.trim() ||
                q.options.some((opt) => !opt.trim())
        );
        if (invalid) {
            alert("Tüm soruları ve seçenekleri doldurun!");
            return;
        }
        setModalStep(3);
    };

    const checkResultOverlap = () => {
        const ranges = newSurvey.results.map((r) => [r.min, r.max]);
        return ranges.some(([min1, max1], i) =>
            ranges.some(([min2, max2], j) =>
                i !== j && min1 <= max2 && max1 >= min2
            )
        );
    };

    const saveSurvey = async () => {
        if (!newSurvey.results.length) {
            alert("En az bir puan aralığı girin!");
            return;
        }
        if (checkResultOverlap()) {
            alert("Puan aralıkları çakışıyor!");
            return;
        }
        try {
            await addCategoryIfNotExists(newSurvey.category);
            if (isEditMode) {
                await updateDoc(doc(db, "surveys", editSurveyId), newSurvey);
                setSurveys((prev) =>
                    prev.map((s) =>
                        s.id === editSurveyId ? { ...s, ...newSurvey } : s
                    )
                );
                alert("Anket güncellendi!");
            } else {
                const data = {
                    ...newSurvey,
                    active: true,
                    createdAt: new Date().toISOString(),
                };
                const docRef = await addDoc(collection(db, "surveys"), data);
                setSurveys((prev) => [...prev, { id: docRef.id, ...data }]);
                alert("Anket kaydedildi!");
            }
            resetModal();
        } catch (err) {
            console.error("Kaydetme hatası:", err);
            alert("Anket kaydedilemedi!");
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
        setNewSurvey((prev) => ({
            ...prev,
            results: [...prev.results, { min: 0, max: 0, resultText: "" }],
        }));
    };

    const updateResultRange = (idx, field, value) => {
        const updated = [...newSurvey.results];
        updated[idx][field] =
            field === "resultText" ? value : parseInt(value) || 0;
        setNewSurvey((prev) => ({ ...prev, results: updated }));
    };

    const removeResultRange = (idx) => {
        const updated = [...newSurvey.results];
        updated.splice(idx, 1);
        setNewSurvey((prev) => ({ ...prev, results: updated }));
    };

    return (
        <div className="tab-content">
            <h2>Anket Yönetimi</h2>

            {/* Filtre */}
            <div className="filter-container">
                <label>Kategori:</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="Tümü">Tümü</option>
                    {categories.map((cat, i) => (
                        <option key={i} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <button
                className="add-btn"
                onClick={() => {
                    resetModal();
                    setShowModal(true);
                }}
            >
                + Yeni Anket
            </button>

            {/* Anketler Tablosu */}
            <table className="surveys-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Başlık</th>
                        <th>Kategori</th>
                        <th>Soru Sayısı</th>
                        <th>Durum</th>
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
                                <span
                                    className={
                                        s.active ? "survey-status active" : "survey-status inactive"
                                    }
                                >
                                    {s.active ? "Aktif" : "Pasif"}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="edit-btn"
                                    onClick={() => {
                                        setIsEditMode(true);
                                        setEditSurveyId(s.id);
                                        const { id, createdAt, active, ...surveyData } = s;
                                        setNewSurvey(surveyData);
                                        setModalStep(1);
                                        setShowModal(true);
                                    }}
                                >
                                    Düzenle
                                </button>
                                <button
                                    className={`status-btn ${s.active ? "active" : "inactive"}`}
                                    onClick={() => toggleSurveyStatus(s.id)}
                                >
                                    {s.active ? "Pasif Yap" : "Aktif Yap"}
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteSurvey(s.id)}
                                >
                                    Sil
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h2>
                                {isEditMode
                                    ? "Anketi Düzenle"
                                    : `Yeni Anket - Adım ${modalStep}/3`}
                            </h2>
                            <button className="close-btn" onClick={resetModal}>
                                ×
                            </button>
                        </div>

                        {modalStep === 1 && (
                            <div className="modal-form">
                                <label>Başlık</label>
                                <input
                                    type="text"
                                    value={newSurvey.title}
                                    onChange={(e) =>
                                        setNewSurvey((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder="Anket başlığı"
                                />
                                <label>Kategori</label>
                                <input
                                    type="text"
                                    value={newSurvey.category}
                                    onChange={(e) =>
                                        setNewSurvey((prev) => ({
                                            ...prev,
                                            category: e.target.value,
                                        }))
                                    }
                                    placeholder="Kategori"
                                />
                                <label>Soru Sayısı</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={newSurvey.questionCount}
                                    onChange={(e) =>
                                        setNewSurvey((prev) => ({
                                            ...prev,
                                            questionCount: parseInt(e.target.value) || 1,
                                        }))
                                    }
                                />
                            </div>
                        )}

                        {modalStep === 2 && (
                            <div className="modal-form">
                                <h3>Sorular ve Seçenekler</h3>
                                {newSurvey.questions.map((q, qIdx) => (
                                    <div key={qIdx} className="question-item">
                                        <div className="question-header">
                                            <h4>Soru {qIdx + 1}</h4>
                                            <button
                                                onClick={() => {
                                                    if (newSurvey.questions.length <= 1) {
                                                        alert("En az 1 soru olmalı!");
                                                        return;
                                                    }
                                                    if (window.confirm("Bu soruyu silmek istediğine emin misin?")) {
                                                        const updatedQuestions = [...newSurvey.questions];
                                                        updatedQuestions.splice(qIdx, 1); // Soruyu sil
                                                        setNewSurvey((prev) => ({
                                                            ...prev,
                                                            questions: updatedQuestions,
                                                            questionCount: prev.questionCount - 1,
                                                        }));
                                                    }
                                                }}
                                                className={`remove-question-btn ${newSurvey.questions.length <= 1 ? "disabled" : ""}`}
                                                disabled={newSurvey.questions.length <= 1}
                                            >
                                                ❌ Soruyu Sil
                                            </button>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder={`Soru ${qIdx + 1}`}
                                            value={q.question}
                                            onChange={(e) =>
                                                updateQuestionField(qIdx, "question", e.target.value)
                                            }
                                        />
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="option-item">
                                                <input
                                                    type="text"
                                                    placeholder={`Seçenek ${oIdx + 1}`}
                                                    value={opt}
                                                    onChange={(e) =>
                                                        updateOptionField(qIdx, oIdx, e.target.value)
                                                    }
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={q.optionPoints[oIdx]}
                                                    onChange={(e) =>
                                                        updateOptionPoint(qIdx, oIdx, e.target.value)
                                                    }
                                                    placeholder="Puan"
                                                />
                                                {q.options.length > 2 && (
                                                    <button
                                                        onClick={() => removeOption(qIdx, oIdx)}
                                                        className="remove-option-btn"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addOption(qIdx)}
                                            className="add-option-btn"
                                        >
                                            + Seçenek Ekle
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {modalStep === 3 && (
                            <div className="modal-form">
                                <h3>Puan Aralıkları ve Sonuçlar</h3>
                                {newSurvey.results.map((res, idx) => (
                                    <div key={idx} className="result-item">
                                        <input
                                            type="number"
                                            value={res.min}
                                            onChange={(e) =>
                                                updateResultRange(idx, "min", e.target.value)
                                            }
                                            placeholder="Min Puan"
                                        />
                                        <input
                                            type="number"
                                            value={res.max}
                                            onChange={(e) =>
                                                updateResultRange(idx, "max", e.target.value)
                                            }
                                            placeholder="Max Puan"
                                        />
                                        <input
                                            type="text"
                                            value={res.resultText}
                                            onChange={(e) =>
                                                updateResultRange(idx, "resultText", e.target.value)
                                            }
                                            placeholder="Sonuç Metni"
                                        />
                                        <button
                                            onClick={() => removeResultRange(idx)}
                                            className="remove-result-btn"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addResultRange}
                                    className="add-result-btn"
                                >
                                    + Sonuç Ekle
                                </button>
                            </div>
                        )}

                        <div className="modal-actions">
                            {modalStep > 1 && (
                                <button
                                    onClick={() => setModalStep(modalStep - 1)}
                                    className="back-btn"
                                >
                                    Geri
                                </button>
                            )}
                            {modalStep < 3 && (
                                <button
                                    onClick={
                                        modalStep === 1 ? handleStep1Next : handleStep2Next
                                    }
                                    className="next-btn"
                                >
                                    İleri
                                </button>
                            )}
                            {modalStep === 3 && (
                                <button onClick={saveSurvey} className="save-btn">
                                    {isEditMode ? "Güncelle" : "Kaydet"}
                                </button>
                            )}
                            <button onClick={resetModal} className="cancel-btn">
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
