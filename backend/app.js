const express = require('express');
const path = require('path');
const router = express.Router();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const cors = require("cors");
const bcrypt = require("bcrypt");

const connection = require("./conn");

const app = express();

app.locals.con = connection;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "Här är min hemliga nyckel",
  resave: false,
  saveUninitialized: true,
}));
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

// Register user
app.post("/register", async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    await req.app.locals.con.promise().query(
      "INSERT INTO users (userName, userEmail, userPassword) VALUES (?, ?, ?)",
      [userName, userEmail, hashedPassword]
    );

    console.log("User registered successfully");
    res.send({ success: true, message: "User registration successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "There was an error registering the user" });
  }
});

// Login user
app.post("/login", async function (req, res) {
  const { userName, userPassword } = req.body;

  try {
    const [rows] = await req.app.locals.con.promise().query(
      'SELECT * FROM users WHERE userName = ?',
      [userName]
    );

    if (rows.length > 0) {
      const storedPassword = rows[0].userPassword;
      const passwordMatch = await bcrypt.compare(userPassword, storedPassword);
      if (passwordMatch) {
        const userId = rows[0].id;
        req.session.userId = userId;
        res.json({ success: true, userId: userId });
      } else {
        res.json({ success: false, message: "Invalid password" });
      }
    } else {
      res.json({ success: false, message: "Invalid username" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error while logging in the user" });
  }
});

// Save a document
app.post("/saveDoc", async (req, res) => {
  const userId = req.session.userId;
  const { title, content } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    await req.app.locals.con.promise().query(
      "INSERT INTO documents (user_id, title, content) VALUES (?, ?, ?)",
      [userId, title, content]
    );

    console.log("Document saved successfully");
    res.json({ success: true, message: "Document saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while saving the document" });
  }
});

// Get user's documents
app.get("/docs", async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const [rows] = await req.app.locals.con.promise().query(
      "SELECT id, title FROM documents WHERE user_id = ?",
      [userId]
    );

    res.json({ success: true, documents: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while retrieving the documents" });
  }
});

// Get a specific document
app.get("/docs/:id", async (req, res) => {
  const userId = req.session.userId;
  const documentId = req.params.id;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const [rows] = await req.app.locals.con.promise().query(
      'SELECT id, title, content FROM documents WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (rows.length > 0) {
      res.json({ success: true, document: rows[0] });
    } else {
      res.json({ success: false, message: "Document not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while retrieving the document" });
  }
});

// Update a document
app.put("/docs/:id", async (req, res) => {
  const userId = req.session.userId;
  const documentId = req.params.id;
  const { title, content } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    await req.app.locals.con.promise().query(
      'UPDATE documents SET title = ?, content = ? WHERE id = ? AND user_id = ?',
      [title, content, documentId, userId]
    );

    res.json({ success: true, message: "Document updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while updating the document" });
  }
});

// Delete a document
app.delete("/docs/:id", async (req, res) => {
  const userId = req.session.userId;
  const documentId = req.params.id;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    await req.app.locals.con.promise().query(
      'DELETE FROM documents WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while deleting the document" });
  }
});

app.use("/", router); 
module.exports = app;