import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/dashboard.page";
import Layout from "@/components/layout/layout";
import Search from "./pages/search.page";
import Series from "./pages/series.page";
import Watch from "./pages/watch.page";

export default function Router() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/series" element={<Series />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
