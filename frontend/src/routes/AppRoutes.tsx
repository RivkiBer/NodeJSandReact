import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import RegisterPage from "../pages/RegisterPage";

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
