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

const SurveyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleDelete = async () => {
    if (!survey || !id) return;
    const confirmed = window.confirm("האם אתה בטוח שברצונך למחוק את הסקר?");
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/surveys/${id}`);
      navigate("/surveys");
    } catch (err: any) {
      setError(err.response?.data?.message || "מחיקת הסקר נכשלה");
    }
  };

  const canManage = survey?.createdBy.username === user?.username || user?.role === "admin";


  return (
    <div className="survey-detail-container">
      <div className="survey-detail-header">
        <button onClick={() => navigate("/surveys")} className="btn-pagination">
          חזור לרשימה
        </button>
        {canManage && (
          <div className="survey-detail-actions">
            <button onClick={() => navigate(`/surveys/${id}/edit`)} className="btn-create">
              ערוך
            </button>
            <button onClick={handleDelete} className="cancel-button">
              מחק
            </button>
          </div>
        )}
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

          {canManage && (
            <div className="survey-detail-actions">
              <button onClick={() => navigate(`/surveys/${id}/edit`)} className="btn-create">
                ערוך
              </button>
              <button onClick={handleDelete} className="cancel-button">
                מחק
              </button>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <button onClick={() => navigate(`/surveys/${id}/respond`)} className="btn-create">
              ענה על הסקר
            </button>
          </div>

          <div className="questions-list">
            <h2>שאלות</h2>
            {survey.questions.length === 0 ? (
              <div>עדיין לא נוספו שאלות</div>
            ) : (
              <ul>
                {survey.questions.map((q: any) => (
                  <li key={q._id ?? q}>
                    {q.text ?? String(q)}
                    {q.type === "rating" && q.minRating != null && q.maxRating != null ? (
                      <span> — דירוג {q.minRating} עד {q.maxRating}</span>
                    ) : q.type ? (
                      <span> — {q.type}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyDetailPage;
