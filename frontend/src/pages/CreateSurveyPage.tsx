import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAppDispatch } from "../store/hooks";
import { setLoading, setError } from "../store/userSlice";

const createSurveySchema = z.object({
  title: z.string().min(3, "כותרת חייבת להיות לפחות 3 תווים"),
  description: z.string().optional(),
  category: z.string().optional(),
});

type CreateSurveyFormData = z.infer<typeof createSurveySchema>;

const CreateSurveyPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSurveyFormData>({
    resolver: zodResolver(createSurveySchema),
  });

  const onSubmit = async (data: CreateSurveyFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    dispatch(setLoading());

    try {
      const response = await axiosInstance.post("/surveys", data);

      setSuccessMessage("הסקר נוצר בהצלחה!");
      setTimeout(() => navigate(`/surveys/${response.data.survey._id}`), 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || "יצירת הסקר נכשלה. אנא נסה שנית.";
      setErrorMessage(message);
      dispatch(setError(message));
    }
  };

  return (
    <div className="create-survey-container">
      <div className="create-survey-card">
        <h1>צור סקר חדש</h1>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div style={{ color: "green", padding: "12px", borderRadius: "4px", marginBottom: "16px" }}>{successMessage}</div>}

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
              {isSubmitting ? "יוצר..." : "צור סקר"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/surveys")}
              className="cancel-button"
              disabled={isSubmitting}
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSurveyPage;
