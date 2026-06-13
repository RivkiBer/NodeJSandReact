import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";
import { useAppDispatch } from "../store/hooks";
import { setLoading, setUser, setError } from "../store/userSlice";

const loginSchema = z.object({
  username: z.string().min(2, "שם המשתמש חייב להיות לפחות 2 תווים"),
  password: z.string().min(6, "הסיסמה חייבת להיות לפחות 6 תווים"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [message, setMessage] = useState<string | null>(null);
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
    setMessage(null);
    setErrorMessage(null);
    dispatch(setLoading());

    try {
      const response = await axiosInstance.post("/auth/login", data);
      const result = response.data;
      const token = result.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      const user = {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
      };

      localStorage.setItem("user", JSON.stringify(user));
      dispatch(setUser(user));

      navigate("/surveys");
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : error instanceof Error
          ? error.message
          : "Login failed";
      dispatch(setError(message));
      setErrorMessage(message);
    }
  };

  return (
    <main>
      <h1>התחבר</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="username">שם משתמש</label>
          <input id="username" type="text" {...register("username")} />
          {errors.username && <p>{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="password">סיסמה</label>
          <input id="password" type="password" {...register("password")} />
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "מתחבר..." : "התחבר"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </main>
  );
};

export default LoginPage;
