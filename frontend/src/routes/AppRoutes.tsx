import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser } from "../store/userSlice";
import Layout from "../components/Layout";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import SurveysPage from "../pages/SurveysPage";
import CreateSurveyPage from "../pages/CreateSurveyPage";
import SurveyDetailPage from "../pages/SurveyDetailPage";
import RespondSurveyPage from "../pages/RespondSurveyPage";
import EditSurveyPage from "../pages/EditSurveyPage";
import ResponsesPage from "../pages/ResponsesPage";
import AdminUsersPage from "../pages/AdminUsersPage";

interface RequireRoleProps {
  allowedRoles: string[];
  children: JSX.Element;
}

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const token = localStorage.getItem("jwtToken") || localStorage.getItem("token");
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

  const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (!user || !allowedRoles.includes(user.role || "")) {
      return <Navigate to="/surveys" />;
    }

    return children;
  };

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/surveys" /> : <Navigate to="/login" />}
        />

        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/surveys" /> : <RegisterPage />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/surveys" /> : <LoginPage />}
        />

        <Route
          path="/surveys"
          element={isAuthenticated ? <SurveysPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/surveys/create"
          element={
            <RequireRole allowedRoles={["creator", "admin"]}>
              <CreateSurveyPage />
            </RequireRole>
          }
        />

        <Route
          path="/surveys/:id"
          element={isAuthenticated ? <SurveyDetailPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/surveys/:id/respond"
          element={isAuthenticated ? <RespondSurveyPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/surveys/:id/respond"
          element={isAuthenticated ? <RespondSurveyPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/surveys/:id/edit"
          element={isAuthenticated ? <EditSurveyPage /> : <Navigate to="/login" />}
        />

        <Route path="/responses" element={<ResponsesPage />} />

        <Route
          path="/admin/users"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <AdminUsersPage />
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
