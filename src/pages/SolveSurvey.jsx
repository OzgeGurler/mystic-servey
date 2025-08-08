
import React, { useState, useEffect } from "react";
import { Star } from 'lucide-react';
import { useParams } from "react-router-dom";
import { db } from "../services/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../css/SolveSurvey.css";

export default function SolveSurvey() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleStartClick = (starValue) => {
        setRating(starValue);
    }

    const handleStarHover = (starValue) => {
        setHoverRating(starValue);
    }

    const handleMouseLeave = () => {
        setHoverRating(0);
    }

    const handleStarSubmit = async () => {
        try {
            const surveyRef = doc(db, "surveys", id);
            const surveySnap = await getDoc(surveyRef);
            if (surveySnap.exists()) {
                const surveyData = surveySnap.data();
                const prevStars = surveyData.totalStars || 0;
                const prevCount = surveyData.ratingCount || 0;

                const updatedStars = prevStars + rating;
                const updatedCount = prevCount + 1;
                const avg = updatedStars / updatedCount;

                await updateDoc(surveyRef, {
                    totalStars: updatedStars,
                    ratingCount: updatedCount,
                    avarageRating: parseFloat(avg.toFixed(1))
                });


                alert("Teşekkürlet ${rating} yıldız verdiniz.");
            }
        } catch (err) {
            console.error("Yıldız gönderimi başarısız", err)
        }
    };

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const surveyDoc = await getDoc(doc(db, "surveys", id));
                if (surveyDoc.exists()) {
                    setSurvey(surveyDoc.data());
                } else {
                    console.error("Anket bulunamadı!");
                }
            } catch (error) {
                console.error("Anket alınamadı:", error);
            }
        };

        fetchSurvey();
    }, [id]);

    const handleAnswerChange = (questionIndex, optionIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let totalPoints = 0;

        survey.questions.forEach((q, qIndex) => {
            const selectedOption = answers[qIndex];
            if (selectedOption !== undefined) {
                totalPoints += q.optionPoints[selectedOption] || 0;
            }
        });

        let resultMessage = "Sonuç bulunamadı.";
        let resultImage = '';
        for (const r of survey.results) {
            if (totalPoints >= r.min && totalPoints <= r.max) {
                resultMessage = r.resultText;
                resultImage = r.imageUrl || '';
                break;
            }
        }

        setResult({
            totalPoints,
            message: resultMessage,
            imageUrl: resultImage
        });

        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo"));
            if (userInfo && userInfo.id) {
                const userRef = doc(db, "users", userInfo.id);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const completedSurveys = Array.isArray(userData.completedSurveys) ? userData.completedSurveys : [];

                    if (!completedSurveys.includes(String(id))) {
                        const currentCount = userData.completesurvey || 0;
                        const userAnswers = Array.isArray(userData.userAnswers) ? userData.userAnswers : [];

                        const answersArray = Object.entries(answers).map(([qIndex, optionIndex]) => ({
                            questionIndex: parseInt(qIndex),
                            optionIndex
                        }));

                        await updateDoc(userRef, {
                            completesurvey: currentCount + 1,
                            completedSurveys: [...completedSurveys, String(id)],
                            userAnswers: [...userAnswers, {
                                surveyId: id,
                                answers: answersArray
                            }]
                        });
                        console.log("✅ completesurvey ve cevaplar kaydedildi:", id);
                    } else {
                        console.log("ℹ️ Bu anket zaten çözülmüş, sayı artmadı.");
                    }
                }
            }
        } catch (err) {
            console.error("❌ completesurvey/cevap kaydedilemedi:", err);
        }
    };

    if (!survey) {
        return <div className="solve-survey-container">Anket yükleniyor...</div>;
    }

    if (result) {
        return (
            <>
            <div className="result-container">
                <h2>Sonuç</h2>
                {result.imageUrl && (
                  <div className="result-image">
                    <img src={result.imageUrl} alt="Sonuç Görseli" />
                  </div>
                )}
                <p><strong>Puanınız:</strong> {result.totalPoints}</p>
                <p>{result.message}</p>
            </div>
                <div className="result-rating">
                <h2> Anketi Puanla </h2>
                    <div className="rating-container">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star 
                    key={starValue}
                    size={40}
                    className="result-stars"
                    onClick={() => handleStartClick(starValue)}
                    onMouseEnter={() => handleStarHover(starValue)}
                    onMouseLeave={handleMouseLeave}
                    />
                    ))}
                    </div>

                    <div className="rating-text">
                        {rating > 0 && (
                            <p className="rating-results">
                                Puanınız <span className="font-bold text-blue-600">{rating} / 5</span>
                            </p>
                        )}

                        {rating > 0 && (
                            <button 
                            className="rating-button"
                            onClick={handleStarSubmit}
                            >
                            </button>
                        )}
                    </div>
                </div>
                </>
        );
    }

    return (
        <div className="solve-survey-container">
            <h2>{survey.title}</h2>
            {survey.coverImage && (
              <div className="cover-image">
                <img src={survey.coverImage} alt={survey.title} />
              </div>
            )}
            <form onSubmit={handleSubmit}>
                {survey.questions.map((q, qIndex) => (
                    <div className="question-block" key={qIndex}>
                        <h3>{qIndex + 1}. {q.question}</h3>
                        {q.imageUrl && (
                          <div className="question-image"><img src={q.imageUrl} alt={`Soru ${qIndex+1}`} /></div>
                        )}
                        {q.options.map((option, oIndex) => (
                            <label key={oIndex} className="option-label">
                                <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    checked={answers[qIndex] === oIndex}
                                    onChange={() => handleAnswerChange(qIndex, oIndex)}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                ))}
                <button type="submit" className="submit-btn">Gönder</button>
            </form>
        </div>
    );
}
