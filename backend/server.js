import 'dotenv/config';
import path from "path";
import { fileURLToPath } from "url";
console.log("🔹 JWT_SECRET:", process.env.JWT_SECRET);
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs'
import csv from "csvtojson";
const uri = "mongodb+srv://ashishvalvinvp:O1z1gYSWysjEInwq@namasteashish.447hw.mongodb.net/?retryWrites=true&w=majority&appName=namasteAshish";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload path using __dirname
const uploadPath = path.join(__dirname, "uploads");

const app = express();
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());


// Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//     const token = req.headers["authorization"]; // Get token from headers
//     if (!token) {
//         return res.status(403).json({ error: "Access denied. No token provided." });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
//         req.user = decoded; // Attach decoded user info to request
//         next(); // Proceed to the next function
//     } catch (error) {
//         res.status(401).json({ error: "Invalid token!" });
//     }
// };

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
 // Initialize multer with storage settings
 const upload = multer({ storage });

// Example of a protected route
app.get("/protected", async (req, res) => {
    const authHeader = req.headers.authorization;
    console.log("🔹 Received Authorization Header:", authHeader);
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No or invalid token format");
      return res.status(401).json({ error: "Invalid token!" });
    }
  
    const token = authHeader.split(" ")[1]; // Extract token
    console.log("✅ Extracted Token:", token);
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token Decoded:", decoded);
      res.status(200).json({ message: "Protected data accessed!" });
    } catch (error) {
      console.log("❌ Token verification failed:", error.message);
      res.status(401).json({ error: "Invalid token!" });
    }
  });
  


// Connect to MongoDB
mongoose.connect(uri, { dbName:'test'})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Define User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    mobile: String,
    password: String,
    csvFile: String, // Store the uploaded file path
  });

const User = mongoose.model('User', UserSchema);

// 🔹 Route: Sign-up (Registers a new user)
app.post('/signup', async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({ username, email, mobile, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

//return a list of uploaded files.
app.get("/files", (req, res) => {
    fs.readdir("uploads", (err, files) => {
      if (err) {
        console.error("🔥 Error reading directory:", err);
        return res.status(500).json({ error: "Failed to list files" });
      }
      res.json({ files });
    });
  });

// 🔹 Route: Login (Generates JWT on successful login)
app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for:", email);
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log("❌ User not found in DB");
        return res.status(404).json({ error: "User not found!" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Password incorrect!");
        return res.status(401).json({ error: "Invalid credentials!" });
      }
  
      // Generate JWT Token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      console.log("✅ Generated Token:", token);  // Log token here
  
      res.status(200).json({ message: "Login successful!", token });
    } catch (error) {
      console.error("🔥 Login error:", error);
      res.status(500).json({ error: "Error logging in" });
    }
  });
  
  
// 🔹 Middleware: Protect routes by verifying JWT


// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });
  
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = decoded;
      next();
    });
  };


// **Upload CSV Route**
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded!" });
      }
  
      console.log("✅ File uploaded:", req.file.filename);
      res.json({ message: "File uploaded successfully!", filename: req.file.filename });
    } catch (error) {
      console.error("🔥 Upload error:", error);
      res.status(500).json({ error: "Internal server error during file upload" });
    }
  });
  
  
  // ✅ Apply Middleware to Protected Route
  app.get("/protected", authenticateToken, (req, res) => {
    res.status(200).json({ message: "Welcome to protected route!" });
  });
  
  app.get("/dashboard", authenticateToken, (req, res) => {
    res.json({ message: "Welcome to your Dashboard!" });
  });

  // file processing data 
  const keyword = [
    "Target No", "Call Type", "TOC", "B Party No", "LRN No", "LRN TSP-LSA", "Date", "Time", "Dur(s)",
    "First CGI Lat/Long", "First CGI", "Last CGI Lat/Long", "Last CGI", "SMSC No", "Service Type", "IMEI", "IMSI",
    "Call Fow No", "Roam Nw", "SW & MSC ID", "IN TG", "OUT TG", "Vowifi First UE IP", "Port1", "Vowifi Last UE IP", "Port2"
  ];
  
  app.post("/generate-data/:filename", async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join("uploads", filename);
    const outputJsonPath = path.join("uploads", `${filename}.json`);
  
    // 🔹 Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
  
    try {
      const rows = await csv({ noheader: true, output: "csv" }).fromFile(filePath);
  
      let headerRowIndex = -1;
  
      // Find the first row that contains at least one matching keyword
      for (let i = 0; i < rows.length - 1; i++) {
        if (rows[i].some(cell => keyword.includes(cell))) {
          headerRowIndex = i;
          break;
        }
      }
  
      // If no matching row is found, stop execution
      if (headerRowIndex === -1) {
        return res.status(400).json({ error: "No header row found matching the keyword list." });
      }
  
      const headers = rows[headerRowIndex]; // This row will be the header (keys)
      const dataRows = rows.slice(headerRowIndex + 1); // All rows after the header
  
      const jsonData = dataRows.map(row => {
        let obj = {};
        headers.forEach((key, index) => {
          obj[key] = row[index] || ""; // Assign value or empty string if missing
        });
        return obj;
      });
  
      // 🔹 Write JSON file
      fs.writeFileSync(outputJsonPath, JSON.stringify(jsonData, null, 4));
  
      console.log(`✅ CSV converted to JSON successfully!`);
      res.json({ message: `✅ Data generated successfully for ${filename}`, jsonFile: `${filename}.json` });
    } catch (error) {
      console.error("🔥 Error processing CSV:", error);
      res.status(500).json({ error: "Error processing file" });
    }
  });
  
  // Function to process JSON data
function processJsonData(jsonData) {
    const cleanData = [];
    
    // Extract the first key and its value from the JSON file
    const firstKey = Object.keys(jsonData[0])[0]; // Example: "TARGET NUMBER"
    const firstValue = jsonData[0][firstKey];
    
    // Initialize cleanData with the first object
    cleanData.push({ [firstKey]: firstValue });
    
    // Loop through each object in the JSON array
    for (let obj of jsonData) {
        const bPartyNumber = obj["B PARTY NUMBER"];
        
        if (!bPartyNumber) continue; // Skip if B PARTY NUMBER is missing
        
        // Check if bPartyNumber exists in cleanData
        let found = false;
        for (let entry of cleanData) {
            if (entry.hasOwnProperty(bPartyNumber)) {
                entry[bPartyNumber] += 1; // Increment count
                found = true;
                break;
            }
        }
        
        // If not found, create a new object
        if (!found) {
            cleanData.push({ [bPartyNumber]: 1 });
        }
    }
    
    return cleanData;
}

// Function to arrange objects
function arrangeObjects(cleanData) {
    if (cleanData.length <= 1) return cleanData;
    
    // Extract the first object and sort the rest based on their values in descending order
    const firstObject = cleanData[0];
    const sortedObjects = cleanData.slice(1).sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
    
    return [firstObject, ...sortedObjects];
}

// 📌 Add the `/report/:filename` Route
app.get("/report/:filename", (req, res) => {
    const { filename } = req.params;
    const jsonFilePath = path.join("uploads", `${filename}.json`);

    // 🔹 Check if JSON file exists
    if (!fs.existsSync(jsonFilePath)) {
        return res.status(404).json({ error: "JSON file not found" });
    }

    try {
        const rawData = fs.readFileSync(jsonFilePath, "utf8");
        const jsonData = JSON.parse(rawData);

        // Process and arrange the data
        const processedData = processJsonData(jsonData);
        const arrangedData = arrangeObjects(processedData);

        res.json(arrangedData);
    } catch (error) {
        console.error("🔥 Error processing report:", error);
        res.status(500).json({ error: "Error processing report" });
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


