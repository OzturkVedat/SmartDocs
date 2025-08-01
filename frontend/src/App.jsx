import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

import DocumentListPage from "./pages/DocumentListPage";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DocumentListPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
