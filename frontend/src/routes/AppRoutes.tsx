import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser } from "../store/userSlice";
import Layout from "../components/Layout";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const isAuthenticated = !!user || !!token;

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          dispatch(setUser(JSON.parse(storedUser)));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
  }, [dispatch, user]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
