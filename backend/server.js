import 'dotenv/config';
import path from "path";
import { fileURLToPath } from "url";
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import csv from "csvtojson";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔹 JWT_SECRET:", process.env.JWT_SECRET);

// MongoDB Connection
const uri = process.env.MONGO_URI || "mongodb+srv://ashishvalvinvp:O1z1gYSWysjEInwq@namasteashish.447hw.mongodb.net/?retryWrites=true&w=majority&appName=namasteAshish";
mongoose.connect(uri, { dbName: 'test' })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error("🔥 MongoDB Connection Error:", err));

// Express App Setup
const app = express();
app.use(cors({
  origin: "https://www.ashishvalvi.in", // Allow frontend requests
  methods: "GET,POST",
  credentials: true,
}));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Multer File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Mongoose User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  mobile: String,
  password: String,
});
const User = mongoose.model('User', UserSchema);

// 🔹 User Registration Route
app.post('/signup', async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, mobile, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "✅ User registered successfully!" });
  } catch (error) {
    console.error("🔥 Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// 🔹 User Login Route (JWT Authentication)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials!" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "✅ Login successful!", token });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// 🔹 Middleware: JWT Authentication
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// 🔹 Upload CSV Route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded!" });
  res.json({ message: "✅ File uploaded successfully!", filename: req.file.filename });
});

// 🔹 List Uploaded Files
app.get("/files", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to list files" });
    res.json({ files });
  });
});

// 🔹 Protected Route Example
app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "✅ Welcome to protected route!" });
});

// 🔹 Generate Data from CSV
app.post("/generate-data/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join("uploads", filename);
  const outputJsonPath = path.join("uploads", `${filename}.json`);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

  try {
    const rows = await csv({ noheader: true, output: "csv" }).fromFile(filePath);
    const headers = rows[0];
    const jsonData = rows.slice(1).map(row => Object.fromEntries(headers.map((key, i) => [key, row[i] || ""])));

    fs.writeFileSync(outputJsonPath, JSON.stringify(jsonData, null, 4));
    res.json({ message: `✅ Data generated successfully for ${filename}`, jsonFile: `${filename}.json` });
  } catch (error) {
    console.error("🔥 Error processing CSV:", error);
    res.status(500).json({ error: "Error processing file" });
  }
});

// 🔹 Generate Report from JSON
app.get("/report/:filename", (req, res) => {
  const { filename } = req.params;
  const jsonFilePath = path.join("uploads", `${filename}.json`);

  if (!fs.existsSync(jsonFilePath)) return res.status(404).json({ error: "JSON file not found" });

  try {
    const rawData = fs.readFileSync(jsonFilePath, "utf8");
    const jsonData = JSON.parse(rawData);
    
    // Process data to generate a report
    const processJsonData = (data) => {
      const cleanData = [];
      const firstKey = Object.keys(data[0])[0];
      cleanData.push({ [firstKey]: data[0][firstKey] });

      data.forEach(obj => {
        const bPartyNumber = obj["B PARTY NUMBER"];
        if (!bPartyNumber || /\D/.test(bPartyNumber)) return; // Ignore non-numeric values

        let found = cleanData.find(entry => entry[bPartyNumber]);
        if (found) found[bPartyNumber]++;
        else cleanData.push({ [bPartyNumber]: 1 });
      });

      return cleanData.sort((a, b) => Object.values(b)[0] - Object.values(a)[0]).slice(0, 10);
    };

    const arrangedData = processJsonData(jsonData);
    res.json(arrangedData);
  } catch (error) {
    console.error("🔥 Error processing report:", error);
    res.status(500).json({ error: "Error processing report" });
  }
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on http://localhost:${PORT}`));