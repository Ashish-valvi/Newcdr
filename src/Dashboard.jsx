import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa"; // Import dark mode icons
import "./SignupPage.css"; // ✅ Reuse the same CSS for consistency

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [jsonFiles, setJsonFiles] = useState([]);
  const navigate = useNavigate();
  const storedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(storedTheme);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:5000/files");
        const data = await response.json();

        const csvFiles = data.files.filter((file) => file.endsWith(".csv"));
        const jsonFileSet = new Set(
          data.files.filter((file) => file.endsWith(".json"))
        );

        setFiles(csvFiles);
        setJsonFiles(jsonFileSet);
      } catch (error) {
        console.error("🔥 Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const handleGenerateData = async (filename) => {
    try {
      const response = await fetch(
        `http://localhost:5000/generate-data/${filename}`,
        { method: "POST" }
      );
      const data = await response.json();

      if (data.jsonFile) {
        alert(`✅ Data generated successfully! JSON file: ${data.jsonFile}`);
      } else {
        alert(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("🔥 Error generating data:", error);
    }
  };

  return (
    <div className="signup-container">
      {/* Dark Mode Toggle Button */}
      <button className="dark-mode-toggle" onClick={toggleTheme}>
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>

      <div className="signup-box">
        <h2>Dashboard</h2>
        <h3>Uploaded CSV Files</h3>
        <ul>
          {files.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            files.map((file, index) => {
              const jsonFilename = `${file}.json`;
              const hasJson = jsonFiles.has(jsonFilename);

              return (
                <li key={index} style={{ listStyle: "none", marginBottom: "10px" }}>
                  <a
                    href={`http://localhost:5000/uploads/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    {file}
                  </a>
                  <button
                    onClick={() => handleGenerateData(file)}
                    style={{ marginLeft: "10px" }}
                  >
                    Generate Data
                  </button>
                  {hasJson && (
                    <button
                      onClick={() => navigate(`/chart/${jsonFilename}`)}
                      style={{
                        marginLeft: "10px",
                        backgroundColor: "green",
                        color: "white",
                      }}
                    >
                      View Report
                    </button>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
