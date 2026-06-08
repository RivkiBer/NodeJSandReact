import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser } from "../store/userSlice";
import Layout from "../components/Layout";
import RegisterPage from "../pages/RegisterPage";
import SurveysPage from "../pages/SurveysPage";
import CreateSurveyPage from "../pages/CreateSurveyPage";
import SurveyDetailPage from "../pages/SurveyDetailPage";
import EditSurveyPage from "../pages/EditSurveyPage";

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
        {/* Public routes */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={isAuthenticated ? <SurveysPage /> : <Navigate to="/register" />}
        />
        <Route
          path="/surveys"
          element={isAuthenticated ? <SurveysPage /> : <Navigate to="/register" />}
        />
        <Route
          path="/surveys/create"
          element={isAuthenticated ? <CreateSurveyPage /> : <Navigate to="/register" />}
        />
        <Route
          path="/surveys/:id"
          element={isAuthenticated ? <SurveyDetailPage /> : <Navigate to="/register" />}
        />
        <Route
          path="/surveys/:id/edit"
          element={isAuthenticated ? <EditSurveyPage /> : <Navigate to="/register" />}
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
