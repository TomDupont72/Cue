import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/dashboard.page";
import Layout from "@/components/layout/layout";
import Search from "./pages/search.page";
import Series from "./pages/series.page";
import Watch from "./pages/watch.page";
import Legal from "./pages/legal.page";
import Privacy from "./pages/privacy.page";
import Terms from "./pages/terms.page";
import Credits from "./pages/credits.page";
import Changelog from "./pages/changelog.page";
import Upcoming from "./pages/upcoming.page";

export default function Router() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/series" element={<Series />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
