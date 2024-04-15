const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cookieParser = require("cookie-parser");
const emailjs = require("emailjs-com"); // Import emailjs library

const app = express();
const PORT = process.env.PORT || 3800;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Database setup
const db = new sqlite3.Database("data.db");
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fname TEXT,
        lname TEXT,
        email TEXT,
        phone TEXT,
        msg TEXT
    )
`);

// Endpoint to handle form submission
app.post("/save", (req, res) => {
  const { fname, lname, email, phone, msg } = req.body;

  // Check if all required fields are provided
  if (!fname || !lname || !email || !phone) {
    return res.status(400).send("All fields are required");
  }

  // Insert form data into the database
  const sql = "INSERT INTO users (fname, lname, email, phone, msg) VALUES (?, ?, ?, ?, ?)";
  const values = [fname, lname, email, phone, msg];
  db.run(sql, values, (err) => {
    if (err) {
      console.error("Error saving form data:", err.message);
      // Check if the error is due to a duplicate email
      if (err.message.includes("UNIQUE constraint failed: users.email")) {
        return res.status(400).send("Email is already in use");
      } else {
        return res.status(500).send("Error saving form data: " + err.message);
      }
    }
    console.log("Form data saved successfully");
    // Redirect the user back to index.html
    res.redirect("/index.html");
  });
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
