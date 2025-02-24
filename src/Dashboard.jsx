require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup to allow requests from your domain
app.use(
  cors({
    origin: "https://www.ashishvalvi.in",
    methods: "GET,POST",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Route for file upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ message: "File uploaded successfully", filename: req.file.filename });
});

// Route to get list of uploaded files
app.get("/files", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to retrieve files" });
    }
    res.json({ files });
  });
});

// Simulated data generation for a CSV file
app.post("/generate-data/:filename", (req, res) => {
  const { filename } = req.params;
  const jsonFile = `${filename}.json`;
  const jsonFilePath = path.join(__dirname, "uploads", jsonFile);

  fs.writeFile(jsonFilePath, JSON.stringify({ message: "Generated data" }), (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to generate data" });
    }
    res.json({ message: "Data generated successfully", jsonFile });
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});