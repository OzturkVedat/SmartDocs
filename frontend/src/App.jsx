import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import DocumentListPage from "./pages/DocumentListPage";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";
import DocumentDetailPage from "./pages/DocumentDetailPage";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

const isAuthenticated = () => !!localStorage.getItem("token");

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={isAuthenticated() ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<DocumentListPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="document/:id" element={<DocumentDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
