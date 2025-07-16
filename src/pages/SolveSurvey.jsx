import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../css/SolveSurvey.css";

export default function SolveSurvey() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        let totalPoints = 0;

        survey.questions.forEach((q, qIndex) => {
            const selectedOption = answers[qIndex];
            if (selectedOption !== undefined) {
                totalPoints += q.optionPoints[selectedOption] || 0;
            }
        });

        let resultMessage = "Sonuç bulunamadı.";
        for (const r of survey.results) {
            if (totalPoints >= r.min && totalPoints <= r.max) {
                resultMessage = r.resultText;
                break;
            }
        }

        setResult({
            totalPoints,
            message: resultMessage
        });
    };

    if (!survey) {
        return <div className="solve-survey-container">Anket yükleniyor...</div>;
    }

    if (result) {
        return (
            <div className="result-container">
                <h2>Sonuç</h2>
                <p><strong>Puanınız:</strong> {result.totalPoints}</p>
                <p>{result.message}</p>
            </div>
        );
    }

    return (
        <div className="solve-survey-container">
            <h2>{survey.title}</h2>
            <form onSubmit={handleSubmit}>
                {survey.questions.map((q, qIndex) => (
                    <div className="question-block" key={qIndex}>
                        <h3>{qIndex + 1}. {q.question}</h3>
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
