import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAppSelector } from "../store/hooks";

const editSurveySchema = z.object({
  title: z.string().min(3, "הכותרת חייבת להיות לפחות 3 תווים"),
  description: z.string().optional(),
  category: z.string().optional(),
});

type EditSurveyFormData = z.infer<typeof editSurveySchema>;

const EditSurveyPage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<any | null>(null);
  const user = useAppSelector((state) => state.user.user);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("text");
  const [qOptions, setQOptions] = useState<string[]>([""]);
  const [qRequired, setQRequired] = useState(false);
  const [minRating, setMinRating] = useState(1);
  const [maxRating, setMaxRating] = useState(5);
  const [minLabel, setMinLabel] = useState("");
  const [maxLabel, setMaxLabel] = useState("");
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditSurveyFormData>({
    resolver: zodResolver(editSurveySchema),
  });

  const fetchSurvey = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/surveys/${id}`);
      const data = response.data;
      setSurvey(data.survey || data);
      reset({
        title: data.title,
        description: data.description || "",
        category: data.category || "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "לא ניתן לטעון את הסקר");
    } finally {
      setLoading(false);
    }
  };

  const canManage = !!survey && (user?.role === "admin" || user?.username === survey.createdBy.username);

  const handleAddOption = () => setQOptions((s) => [...s, ""]);
  const handleRemoveOption = (index: number) => setQOptions((s) => s.filter((_, i) => i !== index));
  const handleOptionChange = (index: number, value: string) => setQOptions((s) => s.map((o, i) => (i === index ? value : o)));

  const handleCreateQuestion = async () => {
    if (!id) return;
    setCreatingQuestion(true);
    try {
      const payload: any = {
        survey: id,
        text: qText,
        type: qType,
        required: qRequired,
      };
      if (qType === "single-choice" || qType === "multiple-choice") {
        payload.options = qOptions.filter((o) => o.trim() !== "");
      }
      if (qType === "rating") {
        payload.minRating = Number(minRating) || 1;
        payload.maxRating = Number(maxRating) || 5;
        if (minLabel && minLabel.trim() !== "") payload.minLabel = minLabel.trim();
        if (maxLabel && maxLabel.trim() !== "") payload.maxLabel = maxLabel.trim();
      }
      await axiosInstance.post(`/questions`, payload);
      setQText("");
      setQType("text");
      setQOptions([""]);
      setQRequired(false);
      setMinRating(1);
      setMaxRating(5);
      setMinLabel("");
      setMaxLabel("");
      setShowQuestionForm(false);
      await fetchSurvey();
    } catch (err: any) {
      console.error(err);
      setError("שגיאה ביצירת השאלה");
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("למחוק שאלה זו?")) return;
    try {
      await axiosInstance.delete(`/questions/${questionId}`);
      await fetchSurvey();
    } catch (err) {
      setError("שגיאה במחיקת השאלה");
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const onSubmit = async (data: EditSurveyFormData) => {
    if (!id) return;
    setError(null);
    setSuccessMessage(null);

    try {
      await axiosInstance.put(`/surveys/${id}`, data);
      setSuccessMessage("הסקר עודכן בהצלחה!");
      setTimeout(() => navigate(`/surveys/${id}`), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "עדכון הסקר נכשל");
    }
  };

  return (
    <div className="create-survey-container">
      <div className="create-survey-card">
        <h1>ערוך סקר</h1>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div style={{ color: "green", padding: "12px", borderRadius: "4px", marginBottom: "16px" }}>
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="loading">טוען סקר...</div>
        ) : (
          <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="title">כותרת הסקר *</label>
              <input
                id="title"
                type="text"
                placeholder="הכנס כותרת לסקר"
                {...register("title")}
                disabled={isSubmitting}
              />
              {errors.title && <span className="error-text">{errors.title.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">תיאור</label>
              <textarea
                id="description"
                placeholder="תיאור אופציונלי של הסקר"
                {...register("description")}
                disabled={isSubmitting}
                rows={4}
                className="textarea-input"
              />
              {errors.description && <span className="error-text">{errors.description.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">קטגוריה</label>
              <select {...register("category")} disabled={isSubmitting} className="category-select">
                <option value="">בחר קטגוריה</option>
                <option value="technology">טכנולוגיה</option>
                <option value="education">חינוך</option>
                <option value="health">בריאות</option>
                <option value="business">עסקים</option>
                <option value="other">אחר</option>
              </select>
              {errors.category && <span className="error-text">{errors.category.message}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? "מעדכן..." : "שמור שינויים"}
              </button>
              <button type="button" onClick={() => navigate(`/surveys/${id}`)} className="cancel-button">
                ביטול
              </button>
            </div>
          </form>
          {canManage && (
            <div className="questions-section" style={{ marginTop: 24 }}>
              <h2>שאלות בסקר</h2>
              {survey?.questions?.length ? (
                <ul className="questions-list">
                  {survey.questions.map((q: any) => (
                    <li key={q._id} className="question-item">
                      <div>
                        <strong>{q.text}</strong>
                        <div style={{ fontSize: 12, color: "#666" }}>{q.type}</div>
                      </div>
                      <div>
                        <button className="danger-button" onClick={() => handleDeleteQuestion(q._id)}>
                          מחק
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>אין עדיין שאלות בסקר זה.</div>
              )}

              <div style={{ marginTop: 12 }}>
                {!showQuestionForm ? (
                  <button className="submit-button" onClick={() => setShowQuestionForm(true)}>
                    הוספת שאלה חדשה
                  </button>
                ) : (
                  <div className="question-form">
                    <div className="form-group">
                      <label>טקסט השאלה</label>
                      <input value={qText} onChange={(e) => setQText(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label>סוג שאלה</label>
                      <select value={qType} onChange={(e) => setQType(e.target.value)}>
                        <option value="text">טקסט</option>
                        <option value="single-choice">בחירה יחידה</option>
                        <option value="multiple-choice">בחירה מרובה</option>
                        <option value="rating">דירוג</option>
                      </select>
                    </div>

                    {(qType === "single-choice" || qType === "multiple-choice") && (
                      <div className="form-group">
                        <label>אפשרויות</label>
                        {qOptions.map((opt, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                            <input value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} />
                            <button className="danger-button" onClick={() => handleRemoveOption(idx)} type="button">
                              הסר
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={handleAddOption} className="submit-button">
                          הוספת אפשרות
                        </button>
                      </div>
                    )}

                    {qType === "rating" && (
                      <div className="form-group">
                        <label>טווח דירוג</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input type="number" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} />
                          <div style={{ alignSelf: "center" }}>עד</div>
                          <input type="number" value={maxRating} onChange={(e) => setMaxRating(Number(e.target.value))} />
                        </div>
                      </div>
                    )}
                    {qType === "rating" && (
                      <div className="form-group">
                        <label>תוויות קצה (מה זה 1 ומה זה 5)</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input placeholder="תווית ל-1" value={minLabel} onChange={(e) => setMinLabel(e.target.value)} />
                          <div style={{ alignSelf: "center" }}>—</div>
                          <input placeholder="תווית ל-5" value={maxLabel} onChange={(e) => setMaxLabel(e.target.value)} />
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label>
                        <input type="checkbox" checked={qRequired} onChange={(e) => setQRequired(e.target.checked)} />
                        חובה
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="submit-button"
                        onClick={() => handleCreateQuestion()}
                        disabled={creatingQuestion}
                        type="button"
                      >
                        {creatingQuestion ? "יוצר..." : "צור שאלה"}
                      </button>
                      <button className="cancel-button" onClick={() => setShowQuestionForm(false)} type="button">
                        ביטול
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default EditSurveyPage;
