import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";
import { useAppDispatch } from "../store/hooks";
import { setLoading, setUser, setError } from "../store/userSlice";

const registerSchema = z.object({
  username: z.string().min(3, "שם משתמש חייב להיות לפחות 3 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(6, "סיסמה חייבת להיות לפחות 6 תווים"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setMessage(null);
    setErrorMessage(null);
    dispatch(setLoading());

    try {
      const response = await axiosInstance.post("/auth/register", data);
      const result = response.data;
      const token = result.token;

      if (token) {
        localStorage.setItem("jwtToken", token);
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      dispatch(
        setUser({
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
        })
      );

      setMessage("Registration successful! You are now logged in.");
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : error instanceof Error
          ? error.message
          : "ההרשמה נכשלה";
      dispatch(setError(message));
      setErrorMessage(message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>הרשמה</h1>

        {message && <div style={{ color: "green", marginBottom: "16px" }}>{message}</div>}
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
            <label htmlFor="email">אימייל</label>
            <input
              id="email"
              type="email"
              placeholder="הכנס אימייל"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
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
            {isSubmitting ? "מעבד..." : "הרשם"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default RegisterPage;
