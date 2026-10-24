import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "@/components/layout/layout";
import Changelog from "@/pages/changelog.page";
import Credits from "@/pages/credits.page";
import Dashboard from "@/pages/dashboard/dashboard.page";
import Legal from "@/pages/legal.page";
import Privacy from "@/pages/privacy.page";
import Search from "@/pages/search/search.page";
import Series from "@/pages/series/series.page";
import Stats from "@/pages/stats/statsContent";
import Terms from "@/pages/terms.page";
import Upcoming from "@/pages/upcoming/upcoming.page";
import Watch from "@/pages/watch/watch.page";

export default function Router() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/series" element={<Series />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/stats" element={<Stats />} />
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
