import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAppDispatch } from "../store/hooks";
import { setLoading, setUser, setError } from "../store/userSlice";

const loginSchema = z.object({
  username: z.string().min(3, "שם משתמש חייב להיות לפחות 3 תווים"),
  password: z.string().min(6, "סיסמה חייבת להיות לפחות 6 תווים"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    dispatch(setLoading());

    try {
      const response = await axiosInstance.post("/auth/login", data);
      const result = response.data;

      // Save token to localStorage
      localStorage.setItem("token", result.token);

      // Update Redux state
      dispatch(
        setUser({
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
        })
      );

      // Redirect to home
      navigate("/");
    } catch (error: any) {
      const message = error.response?.data?.message || "הכניסה נכשלה. אנא נסה שנית.";
      setErrorMessage(message);
      dispatch(setError(message));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>כניסה</h1>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="username">שם משתמש</label>
            <input
              id="username"
              type="text"
              placeholder="הכנס שם משתמש"
              {...register("username")}
              disabled={isSubmitting}
            />
            {errors.username && <span className="error-text">{errors.username.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              id="password"
              type="password"
              placeholder="הכנס סיסמה"
              {...register("password")}
              disabled={isSubmitting}
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? "מעבד..." : "התחבר"}
          </button>
        </form>

        <p className="auth-link">
          עדיין לא רשום? <a href="/register">הרשם כאן</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
