import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig"; // Firebase config dosyası
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import "../css/AdminPage.css";
import "../css/SurveysTab.css";

export default function SurveysTab() {
    const [surveys, setSurveys] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editSurveyId, setEditSurveyId] = useState(null);

    const [newSurvey, setNewSurvey] = useState({
        title: "",
        questionCount: 1,
        questions: []
    });

    // Firebase'den anketleri getir
    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "surveys"));
            const surveysData = [];
            querySnapshot.forEach((doc) => {
                surveysData.push({ id: doc.id, ...doc.data() });
            });
            setSurveys(surveysData);
        } catch (error) {
            console.error("Anketler getirilemedi:", error);
        }
    };

    const toggleSurveyStatus = async (id) => {
        try {
            const survey = surveys.find((s) => s.id === id);
            await updateDoc(doc(db, "surveys", id), {
                active: !survey.active
            });
            const updated = surveys.map((s) =>
                s.id === id ? { ...s, active: !s.active } : s
            );
            setSurveys(updated);
        } catch (error) {
            console.error("Anket durumu güncellenemedi:", error);
        }
    };

    const deleteSurvey = async (id) => {
        if (window.confirm("Bu anketi silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "surveys", id));
                const updated = surveys.filter((s) => s.id !== id);
                setSurveys(updated);
            } catch (error) {
                console.error("Anket silinemedi:", error);
            }
        }
    };

    const resetModal = () => {
        setNewSurvey({
            title: "",
            questionCount: 1,
            questions: []
        });
        setIsEditMode(false);
        setEditSurveyId(null);
        setModalStep(1);
        setShowModal(false);
    };

    // Soruları hazırla
    const prepareQuestions = (count) => {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push({
                id: i + 1,
                question: "",
                options: ["", ""]
            });
        }
        return questions;
    };

    const handleStep1Next = () => {
        // Anket başlığı veya soru sayısı geçersizse uyarı ver ve çık
        if (newSurvey.title.trim() === "" || newSurvey.questionCount < 1) {
            alert("Lütfen anket başlığı ve soru sayısını girin!");
            return;
        }

        let questionsToSet = []; // Güncellenecek soru dizisi

        if (isEditMode) {
            // Düzenleme modundaysak, mevcut sorularla başla
            questionsToSet = [...newSurvey.questions];

            // Yeni soru sayısına göre soruları ayarla
            if (newSurvey.questionCount > questionsToSet.length) {
                // Soru sayısı artırıldıysa, yeni boş sorular ekle
                for (let i = questionsToSet.length; i < newSurvey.questionCount; i++) {
                    questionsToSet.push({
                        id: i + 1, // Yeni sorulara benzersiz ID'ler ver
                        question: "",
                        options: ["", ""]
                    });
                }
            } else if (newSurvey.questionCount < questionsToSet.length) {
                // Soru sayısı azaltıldıysa, fazla soruları kaldır
                questionsToSet = questionsToSet.slice(0, newSurvey.questionCount);
            }
            // newSurvey.questionCount, questionsToSet.length'e eşitse, dizinin uzunluğunda bir değişiklik gerekmez.
        } else {
            // Yeni anketler için (veya düzenleme modunda değilsek), sıfırdan sorular oluştur
            questionsToSet = prepareQuestions(newSurvey.questionCount);
        }

        // State'i hazırlanmış veya ayarlanmış sorularla güncelle
        setNewSurvey(prev => ({
            ...prev,
            questions: questionsToSet
        }));

        // Bir sonraki adıma geç
        setModalStep(2);
    };


    const updateQuestion = (questionIndex, field, value) => {
        const updatedQuestions = [...newSurvey.questions];
        updatedQuestions[questionIndex][field] = value;
        setNewSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...newSurvey.questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setNewSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
    };

    const addOption = (questionIndex) => {
        const updatedQuestions = [...newSurvey.questions];
        updatedQuestions[questionIndex].options.push("");
        setNewSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
    };

    const removeOption = (questionIndex, optionIndex) => {
        const updatedQuestions = [...newSurvey.questions];
        if (updatedQuestions[questionIndex].options.length > 2) {
            updatedQuestions[questionIndex].options.splice(optionIndex, 1);
            setNewSurvey((prev) => ({ ...prev, questions: updatedQuestions }));
        }
    };

    const saveSurvey = async () => {
        // Validation
        if (newSurvey.questions.some((q) => q.question.trim() === "")) {
            alert("Lütfen tüm soruları doldurun!");
            return;
        }
        if (
            newSurvey.questions.some((q) =>
                q.options.some((opt) => opt.trim() === "")
            )
        ) {
            alert("Lütfen tüm seçenekleri doldurun!");
            return;
        }

        try {
            if (isEditMode) {
                // Düzenleme
                await updateDoc(doc(db, "surveys", editSurveyId), {
                    title: newSurvey.title,
                    questionCount: newSurvey.questionCount,
                    questions: newSurvey.questions
                });

                setSurveys((prev) =>
                    prev.map((s) =>
                        s.id === editSurveyId
                            ? {
                                  ...s,
                                  title: newSurvey.title,
                                  questionCount: newSurvey.questionCount,
                                  questions: newSurvey.questions
                              }
                            : s
                    )
                );
                alert("Anket başarıyla güncellendi!");
            } else {
                // Ekleme
                const surveyData = {
                    title: newSurvey.title,
                    questionCount: newSurvey.questionCount,
                    questions: newSurvey.questions,
                    active: true,
                    createdAt: new Date().toISOString()
                };

                const docRef = await addDoc(
                    collection(db, "surveys"),
                    surveyData
                );

                setSurveys((prev) => [
                    ...prev,
                    { id: docRef.id, ...surveyData }
                ]);
                alert("Anket başarıyla oluşturuldu!");
            }

            resetModal();
        } catch (error) {
            console.error("Anket kaydedilemedi:", error);
            alert("Anket kaydedilirken bir hata oluştu!");
        }
    };

    const renderStep1 = () => (
        <div className="modal-form">
            <label>Anket Başlığı</label>
            <input
                type="text"
                value={newSurvey.title}
                onChange={(e) =>
                    setNewSurvey((prev) => ({
                        ...prev,
                        title: e.target.value
                    }))
                }
                placeholder="Anket başlığını girin"
            />

            <label>Soru Sayısı</label>
            <input
                type="number"
                min="1"
                max="20"
                value={newSurvey.questionCount}
                onChange={(e) => {
                    const newCount = parseInt(e.target.value) || 1;
                    setNewSurvey((prev) => ({
                        ...prev,
                        questionCount: newCount
                    }));
                }}
                placeholder="Kaç soru olacak?"
            />
            
            {isEditMode && (
                <div className="edit-mode-notice">
                    <small>
                        💡 Düzenleme modunda soru sayısını değiştirebilirsiniz. 
                        Mevcut sorular korunacak, yeni sorular eklenecek veya fazla sorular kaldırılacak.
                    </small>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="modal-form questions-form">
            <h3>Sorular ve Seçenekler</h3>
            {!newSurvey.questions || newSurvey.questions.length === 0 ? (
                <div className="loading-notice">
                    <p>Sorular yükleniyor...</p>
                </div>
            ) : (
                <div className="questions-container">
                    {newSurvey.questions.map((question, qIndex) => (
                        <div key={qIndex} className="question-item">
                            <h4>Soru {qIndex + 1}</h4>
                            <input
                                type="text"
                                value={question.question}
                                onChange={(e) =>
                                    updateQuestion(
                                        qIndex,
                                        "question",
                                        e.target.value
                                    )
                                }
                                placeholder="Soruyu yazın"
                                className="question-input"
                            />

                            <div className="options-container">
                                <label>Seçenekler:</label>
                                {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="option-item">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) =>
                                                updateOption(
                                                    qIndex,
                                                    oIndex,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={`Seçenek ${oIndex + 1}`}
                                            className="option-input"
                                        />
                                        {question.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeOption(qIndex, oIndex)
                                                }
                                                className="remove-option-btn"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addOption(qIndex)}
                                    className="add-option-btn"
                                >
                                    + Seçenek Ekle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="tab-content">
            <h2>Anket Yönetimi</h2>

            <button
                className="logout-btn"
                onClick={() => {
                    resetModal();
                    setShowModal(true);
                }}
                style={{ marginBottom: "20px" }}
            >
                + Yeni Anket Ekle
            </button>

            {/* İstatistikler */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{surveys.length}</div>
                    <div className="stat-label">Toplam Anket</div>
                </div>
                <div className="stat-card active">
                    <div className="stat-number">
                        {surveys.filter((s) => s.active).length}
                    </div>
                    <div className="stat-label">Aktif Anket</div>
                </div>
                <div className="stat-card inactive">
                    <div className="stat-number">
                        {surveys.filter((s) => !s.active).length}
                    </div>
                    <div className="stat-label">Pasif Anket</div>
                </div>
            </div>

            {/* Anketler Tablosu */}
            <table className="surveys-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Başlık</th>
                        <th>Soru Sayısı</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {surveys.map((survey) => (
                        <tr key={survey.id}>
                            <td>{survey.id}</td>
                            <td>{survey.title}</td>
                            <td>{survey.questionCount || 0}</td>
                            <td>
                                <span
                                    className={
                                        survey.active
                                            ? "survey-status active"
                                            : "survey-status inactive"
                                    }
                                >
                                    {survey.active ? "Aktif" : "Pasif"}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="action-btn edit"
                                    onClick={() => {
                                        setIsEditMode(true);
                                        setEditSurveyId(survey.id);
                                        setNewSurvey({
                                            title: survey.title,
                                            questionCount: survey.questionCount || survey.questions?.length || 1,
                                            questions: survey.questions || []
                                        });
                                        setModalStep(1);
                                        setShowModal(true);
                                    }}
                                >
                                    Düzenle
                                </button>
                                <button
                                    className={`action-btn toggle ${survey.active ? 'active' : 'inactive'}`}
                                    onClick={() => toggleSurveyStatus(survey.id)}
                                    style={{ marginLeft: "5px" }}
                                >
                                    {survey.active ? "Pasif Yap" : "Aktif Yap"}
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => deleteSurvey(survey.id)}
                                    style={{ marginLeft: "5px" }}
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
                    <div className={`modal-content large-modal ${isEditMode ? 'edit-mode' : ''}`}>
                        <div className="modal-header">
                            <h2>
                                {isEditMode
                                    ? "Anketi Düzenle"
                                    : modalStep === 1
                                    ? "Yeni Anket Ekle - Adım 1/2"
                                    : "Yeni Anket Ekle - Adım 2/2"}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={resetModal}
                            >
                                &times;
                            </button>
                        </div>

                        {modalStep === 1 ? renderStep1() : renderStep2()}

                        <div className="modal-actions">
                            <button
                                className="modal-btn cancel"
                                onClick={resetModal}
                            >
                                İptal
                            </button>

                            {modalStep === 1 ? (
                                <button
                                    className="modal-btn save"
                                    onClick={handleStep1Next}
                                >
                                    Sonraki Adım
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="modal-btn back-btn"
                                        onClick={() => setModalStep(1)}
                                    >
                                        Geri
                                    </button>
                                    <button
                                        className="modal-btn save"
                                        onClick={saveSurvey}
                                    >
                                        {isEditMode
                                            ? "Anketi Güncelle"
                                            : "Anketi Kaydet"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}