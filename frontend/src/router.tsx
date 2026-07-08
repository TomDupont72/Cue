import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/dashboard.page";

export default function Router() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
