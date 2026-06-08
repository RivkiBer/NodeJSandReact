import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser } from "../store/userSlice";
import Layout from "../components/Layout";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import SurveysPage from "../pages/SurveysPage";
import SurveyDetailPage from "../pages/SurveyDetailPage";
import CreateSurveyPage from "../pages/CreateSurveyPage";
import EditSurveyPage from "../pages/EditSurveyPage";
import ResponsesPage from "../pages/ResponsesPage";

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const token = localStorage.getItem("jwtToken");
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
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/surveys" /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/surveys"
          element={isAuthenticated ? <SurveysPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/surveys/create"
          element={isAuthenticated ? <CreateSurveyPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/surveys/:id"
          element={isAuthenticated ? <SurveyDetailPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/surveys/:id/edit"
          element={isAuthenticated ? <EditSurveyPage /> : <Navigate to="/login" />}
        />
        <Route path="/responses" element={<ResponsesPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
