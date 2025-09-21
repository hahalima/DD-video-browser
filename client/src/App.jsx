import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import VideoDetailPage from "./pages/VideoDetailPage.jsx";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/video/:id" element={<VideoDetailPage />} />
      </Routes>
    </>
  );
}