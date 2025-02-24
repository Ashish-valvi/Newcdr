import { useState } from "react";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null); // 🔹 Define selectedFile
  const [message, setMessage] = useState("");

  // Function to handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Store selected file in state
  };

  // Function to handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // 🔹 Ensure field name matches backend
    //fetch(`${import.meta.env.VITE_BACKEND_URL}/users`)
    //fetch("http://localhost:5000/upload", 
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json(); // Ensure response is JSON

      if (response.ok) {
        console.log("✅ Upload success:", data.message);
        setMessage("Upload successful!");
      } else {
        console.log("❌ Upload failed:", data.error);
        setMessage(data.error);
      }
    } catch (error) {
      console.error("🔥 Error uploading file:", error);
      setMessage("Error uploading file!");
    }
  };

  return (
    <div>
      <h2>Upload CSV File</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".csv" onChange={handleFileChange} /> {/* 🔹 Set File */}
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Upload;
