import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

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
        )}
      </div>
    </div>
  );
};

export default EditSurveyPage;
