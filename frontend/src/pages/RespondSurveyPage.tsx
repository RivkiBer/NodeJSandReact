import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAppSelector } from "../store/hooks";

interface Survey {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  questions: any[];
  createdAt: string;
  updatedAt: string;
}

const RespondSurveyPage = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user);

  const fetchSurvey = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<Survey>(`/surveys/${id}`);
      setSurvey(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "לא ניתן לטעון את הסקר");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleToggleMultipleChoice = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? [...(prev[questionId] as string[])] : [];
      const index = current.indexOf(option);
      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(option);
      }
      return { ...prev, [questionId]: current };
    });
  };

  const isEmptyValue = (value: unknown) => {
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    );
  };

  const renderInputForQuestion = (question: any) => {
    const currentValue = answers[question._id];

    switch (question.type) {
      case "text":
        return (
          <textarea
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="הכנס תשובה"
            rows={4}
          />
        );
      case "single-choice":
        return (
          <div className="choice-group">
            {question.options?.map((option: string) => (
              <label key={option} className="choice-option">
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={currentValue === option}
                  onChange={() => handleAnswerChange(question._id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        );
      case "multiple-choice":
        return (
          <div className="choice-group">
            {question.options?.map((option: string) => (
              <label key={option} className="choice-option">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(currentValue) && currentValue.includes(option)}
                  onChange={() => handleToggleMultipleChoice(question._id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        );
      case "rating":
        const min = question.minRating ?? 1;
        const max = question.maxRating ?? 5;
        const value = typeof currentValue === "number" ? currentValue : min;
        return (
          <div className="rating-input" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => handleAnswerChange(question._id, Number(e.target.value))}
            />
            <span>{value}</span>
          </div>
        );
      default:
        return <div>סוג שאלה לא נתמך.</div>;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !survey) return;

    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const requests = survey.questions.map((question: any) => {
        let answer = answers[question._id];

        if (question.type === "rating" && answer === undefined) {
          answer = question.minRating ?? 1;
        }

        if (question.required && isEmptyValue(answer)) {
          throw new Error("יש לענות על כל השאלות החייבות.");
        }

        if (isEmptyValue(answer)) {
          return null;
        }

        return axiosInstance.post("/responses", {
          survey: id,
          question: question._id,
          answer,
        });
      });

      const validRequests = requests.filter((item) => item !== null) as Promise<any>[];
      if (validRequests.length === 0) {
        throw new Error("יש למלא לפחות שאלה אחת לפני השליחה.");
      }

      await Promise.all(validRequests);
      setSuccessMessage("תשובות נשלחו בהצלחה.");
      setAnswers({});
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || "לא ניתן לשלוח את התשובות.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="survey-detail-container">
      <div className="survey-detail-header">
        <button onClick={() => navigate("/surveys")} className="btn-pagination">
          חזור לרשימה
        </button>
        <button onClick={() => navigate(`/surveys/${id}`)} className="btn-create">
          צפה בסקר
        </button>
      </div>

      {loading && <div className="loading">טוען סקר...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && survey && (
        <div>
          <div className="survey-detail-card">
            <h1>{survey.title}</h1>
            {survey.category && <div className="survey-card__category">{survey.category}</div>}
            {survey.description && <p>{survey.description}</p>}
            <div className="survey-detail-meta">
              <span>יוצר: {survey.createdBy.username}</span>
              <span>נוצר בתאריך: {new Date(survey.createdAt).toLocaleDateString("he-IL")}</span>
              <span>שאלות: {survey.questions.length}</span>
            </div>
          </div>

          <div className="survey-answer-section">
            <h2>ענה על הסקר</h2>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {submitError && <div className="error-message">{submitError}</div>}
            <form className="survey-answer-form" onSubmit={handleSubmit}>
              {survey.questions.map((question: any) => (
                <div key={question._id} className="answer-question-card">
                  <label className="question-label">
                    {question.text}
                    {question.required ? " *" : ""}
                  </label>
                  {renderInputForQuestion(question)}
                </div>
              ))}

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="submit-button">
                  {submitting ? "שולח תשובות..." : "שלח תשובות"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RespondSurveyPage;
