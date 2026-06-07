import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import Layout from "../components/Layout";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import SurveysPage from "../pages/SurveysPage";
import CreateSurveyPage from "../pages/CreateSurveyPage";
import SurveyDetailPage from "../pages/SurveyDetailPage";
import EditSurveyPage from "../pages/EditSurveyPage";

const AppRoutes = () => {
  const user = useAppSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const isAuthenticated = !!user || !!token;

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={isAuthenticated ? <SurveysPage /> : <Navigate to="/login" />}
        />
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

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
