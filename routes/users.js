const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { upload, uploadToS3, deleteFileFromS3 } = require("../config/s3");

// GET all users
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// POST create new user
router.post("/", async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
      [name, email, age || null]
    );

    // Fetch the created user
    const [newUser] = await pool.execute("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser[0],
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// POST upload profile photo
router.post("/:id/photo", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Check if user exists
    const [existingUser] = await pool.execute(
      "SELECT id, profile_photo_url FROM users WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old photo from S3 if exists
    if (existingUser[0].profile_photo_url) {
      await deleteFileFromS3(existingUser[0].profile_photo_url);
    }

    // Upload new photo to S3
    const photoUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Update user with new photo URL
    await pool.execute("UPDATE users SET profile_photo_url = ? WHERE id = ?", [
      photoUrl,
      id,
    ]);

    // Fetch the updated user
    const [updatedUser] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: updatedUser[0],
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
      error: error.message,
    });
  }
});

// DELETE profile photo
router.delete("/:id/photo", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and get current photo URL
    const [existingUser] = await pool.execute(
      "SELECT id, profile_photo_url FROM users WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete photo from S3 if exists
    if (existingUser[0].profile_photo_url) {
      await deleteFileFromS3(existingUser[0].profile_photo_url);
    }

    // Update user to remove photo URL
    await pool.execute(
      "UPDATE users SET profile_photo_url = NULL WHERE id = ?",
      [id]
    );

    // Fetch the updated user
    const [updatedUser] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Profile photo deleted successfully",
      data: updatedUser[0],
    });
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile photo",
      error: error.message,
    });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    // Check if user exists
    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it already exists
    if (email) {
      const [emailCheck] = await pool.execute(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }
    if (age !== undefined) {
      updateFields.push("age = ?");
      updateValues.push(age);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    updateValues.push(id);
    const updateQuery = `UPDATE users SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;

    await pool.execute(updateQuery, updateValues);

    // Fetch the updated user
    const [updatedUser] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and get photo URL
    const [existingUser] = await pool.execute(
      "SELECT id, profile_photo_url FROM users WHERE id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete profile photo from S3 if exists
    if (existingUser[0].profile_photo_url) {
      await deleteFileFromS3(existingUser[0].profile_photo_url);
    }

    await pool.execute("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
});

module.exports = router;
