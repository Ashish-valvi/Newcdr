import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import SignupPage from "./SignupPage";
import Login from "./Login";
import Dashboard from "./Dashboard"; // Ensure correct import
import Upload from "./Upload";
import Chart from "./Chart";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/chart/:filename" element={<Chart />} /> {/* ✅ New Chart route */}
      </Routes>
    </Router>
  </StrictMode>
);
