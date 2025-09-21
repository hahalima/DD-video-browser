import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import VideoDetailPage from "./pages/VideoDetailPage.jsx";

function BrowseStub() {
  return (
    <main className="container">
      <h2>Browse (stub)</h2>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<BrowseStub />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/video/:id" element={<VideoDetailPage />} />
      </Routes>
    </>
  );
}