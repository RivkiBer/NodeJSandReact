import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  questions: string[];
  createdAt: string;
  updatedAt: string;
}

interface SurveysResponse {
  surveys: Survey[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const SurveysPage = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await axiosInstance.get<SurveysResponse>(`/surveys?${params}`);
      setSurveys(response.data.surveys);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch surveys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    fetchSurveys();
  }, [page, search, category]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const user = useAppSelector((state) => state.user.user);

  const handleViewSurvey = (surveyId: string) => {
    navigate(`/surveys/${surveyId}`);
  };

  const handleEditSurvey = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/edit`);
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    const confirmed = window.confirm("האם אתה בטוח שברצונך למחוק את הסקר?");
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/surveys/${surveyId}`);
      fetchSurveys();
    } catch (err: any) {
      setError(err.response?.data?.message || "מחיקת הסקר נכשלה");
    }
  };

  return (
    <div className="surveys-container">
      <div className="surveys-header">
        <h1>סקרים</h1>
        <button className="btn-create" onClick={() => navigate("/surveys/create")}>
          צור סקר
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="surveys-controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="חפש סקרים..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select value={category} onChange={handleCategoryChange} className="category-select">
            <option value="">כל הקטגוריות</option>
            <option value="technology">טכנולוגיה</option>
            <option value="education">חינוך</option>
            <option value="health">בריאות</option>
            <option value="business">עסקים</option>
            <option value="other">אחר</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading State */}
      {loading && <div className="loading">טוען סקרים...</div>}

      {/* Surveys List */}
      {!loading && surveys.length === 0 ? (
        <div className="no-surveys">
          <p>לא נמצאו סקרים. נסה ביטויי חיפוש או מסננים שונים.</p>
        </div>
      ) : (
        <div className="surveys-list">
          {surveys.map((survey) => (
            <div key={survey._id} className="survey-card">
              <div className="survey-card__header">
                <h3 className="survey-card__title">{survey.title}</h3>
                {survey.category && <span className="survey-card__category">{survey.category}</span>}
              </div>

              {survey.description && (
                <p className="survey-card__description">{survey.description}</p>
              )}

              <div className="survey-card__meta">
                <span className="survey-card__creator">יוצר: {survey.createdBy.username}</span>
                <span className="survey-card__questions">
                  {survey.questions.length} שאלה{survey.questions.length !== 1 ? "ות" : ""}
                </span>
              </div>

              <div className="survey-card__date">
                {new Date(survey.createdAt).toLocaleDateString("he-IL")}
              </div>

              <div className="survey-card__actions">
                <button
                  className="survey-card__button"
                  onClick={() => handleViewSurvey(survey._id)}
                >
                  צפה בסקר
                </button>
                {user?.username === survey.createdBy.username && (
                  <>
                    <button className="btn-create" onClick={() => handleEditSurvey(survey._id)}>
                      ערוך
                    </button>
                    <button className="cancel-button" onClick={() => handleDeleteSurvey(survey._id)}>
                      מחק
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="pagination">
          <button onClick={handlePrevPage} disabled={page === 1} className="btn-pagination">
            קודם
          </button>

          <span className="pagination__info">
            עמוד {page} מתוך {totalPages}
          </span>

          <button onClick={handleNextPage} disabled={page === totalPages} className="btn-pagination">
            הבא
          </button>
        </div>
      )}
    </div>
  );
};

export default SurveysPage;
