import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import { Toaster } from "sonner";
import AuthPage from "./pages/AuthPage";

function Shell() {
  return (
    <div className="min-h-screen  text-zinc-100">
      <Outlet />
      <Toaster theme="dark" />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
