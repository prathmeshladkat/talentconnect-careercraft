// routes/courses.js
import express from 'express';
import db from '../db.js';
import { createUploader, cloudinary } from '../config/cloudinary.js'; 
import path from 'path';
import fs from 'fs';

const router = express.Router();
const upload = createUploader('icon');

// Ensure uploads directory exists (for local fallback)
const uploadsDir = path.join(process.cwd(), 'uploads', 'course_icons');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// GET all courses
router.get('/', async (req, res) => {
  try {
    const [courses] = await db.query('SELECT * FROM courses');
    const normalized = courses.map(c => ({
      ...c,
      features: c.features ? c.features.split(',') : []
    }));
    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single course
router.get('/:id', async (req, res) => {
  try {
    const [courses] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (!courses.length) return res.status(404).json({ error: 'Course not found' });
    res.json(courses[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create course
router.post('/', upload.single('icon'), async (req, res) => {
  try {
    

    const { title, description, full_description, duration, level, features } = req.body;

    // Validate title
    if (!title || title.trim() === '') {
      console.error("❌ Title validation failed. Received:", title);
      return res.status(400).json({ error: 'Title required' });
    }

    // Validate file
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ error: 'Icon file is required' });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only image or SVG files are allowed' });
    }

    const featuresString = Array.isArray(features) 
      ? features.join(',') 
      : (features || '');

    let iconUrl = req.file.path;

    // Upload to Cloudinary
    if (req.file.buffer) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'course_icons', resource_type: 'image' },
          (err, result) => err ? reject(err) : resolve(result)
        ).end(req.file.buffer);
      });
      iconUrl = result.secure_url;
    } else {
      iconUrl = `/uploads/course_icons/${req.file.originalname}`;
    }

    const [result] = await db.query(
      'INSERT INTO courses (icon, title, description, full_description, duration, level, features) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [iconUrl, title, description || '', full_description || '', duration || '', level || '', featuresString]
    );

    
    res.status(201).json({ 
      message: 'Course created!', 
      id: result.insertId, 
      icon: iconUrl 
    });

  } catch (err) {
    console.error('❌ POST course error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update course
router.put('/:id', upload.single('icon'), async (req, res) => {
  try {
    
    const { title, description, full_description, duration, level, features } = req.body;

    // Validate title
    if (!title || title.trim() === '') {
      console.error("❌ Title validation failed. Received:", title);
      console.error("❌ Full body:", req.body);
      return res.status(400).json({ error: 'Title required' });
    }

    // Get existing course
    const [[existing]] = await db.query(
      'SELECT icon FROM courses WHERE id = ?',
      [req.params.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let iconUrl = existing.icon; // Keep old icon by default

    // If new file uploaded
    if (req.file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Only image or SVG files allowed' });
      }

      if (req.file.buffer) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'course_icons', resource_type: 'image' },
            (err, result) => err ? reject(err) : resolve(result)
          ).end(req.file.buffer);
        });
        iconUrl = result.secure_url;
      } else {
        iconUrl = `/uploads/course_icons/${req.file.originalname}`;
      }
    }

    const featuresString = Array.isArray(features)
      ? features.join(',')
      : (features || '');

    await db.query(
      `UPDATE courses 
       SET icon=?, title=?, description=?, full_description=?, duration=?, level=?, features=? 
       WHERE id=?`,
      [
        iconUrl,
        title.trim(),
        description?.trim() || '',
        full_description?.trim() || '',
        duration?.trim() || '',
        level?.trim() || '',
        featuresString,
        req.params.id
      ]
    );

    console.log("✅ Course updated successfully");
    res.json({ message: 'Course updated!', icon: iconUrl });

  } catch (err) {
    console.error('❌ PUT course error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE course
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM courses WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted!' });
  } catch (err) {
    console.error('❌ DELETE course error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;