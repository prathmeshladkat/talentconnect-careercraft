// routes/courses.js
import express from 'express';
import db from '../db.js';
import { createUploader, cloudinary } from '../config/cloudinary.js'; 
import path from 'path';
import fs from 'fs';

const router = express.Router();
const upload = createUploader('icon'); // memoryStorage for Cloudinary

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'success_stories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// GET all courses
router.get('/', async (req, res) => {
  try {
    const [courses] = await db.query('SELECT * FROM courses');
    // optional: normalize features to array
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
router.post('/',upload.single('icon'), async (req, res) => {
  try {
    console.log("📥 POST Request Body:", req.body);
    console.log("📁 POST Request File:", req.file);

  const { title, description, full_description, duration, level, features } = req.body;

  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title required' });
    }

  if (!req.file) {
      return res.status(400).json({ error: 'Icon file is required' });
    }

  // ✅ Validate file type (image or svg)
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/svg+xml'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only image or SVG files are allowed' });
    }

  const featuresString = Array.isArray(features) ? features.join(',') : features;

  let iconUrl = req.file.path;

  if (req.file.buffer) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'course_icons',
            resource_type: 'image'
          },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(req.file.buffer);
      });
      iconUrl = result.secure_url;
    } else {
      iconUrl = `/uploads/course_icons/${req.file.originalname}`;
    }

  const [result] = await db.query(
    'INSERT INTO courses (icon,title,description,full_description,duration,level,features) VALUES (?,?,?,?,?,?,?)',
    [iconUrl,title,description,full_description,duration,level,featuresString]
  );
  res.status(201).json({ message:'Course created!', id: result.insertId, icon: iconUrl });
  } catch (err) {
    console.error('POST course error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update course
router.put('/:id',upload.single('icon'), async (req, res) => {
  try {

     console.log("📥 PUT Request Body:", req.body);
    console.log("📁 PUT Request File:", req.file);
    const { title, description, full_description, duration, level, features } = req.body;
   
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title required' });
    }

    // get existing course
    const [[existing]] = await db.query(
      'SELECT icon FROM courses WHERE id = ?',
      [req.params.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let iconUrl = existing.icon; // 👈 default (keep old icon)

    // if new file uploaded
    if (req.file) {
      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml'
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Only image or SVG files allowed' });
      }

      if (req.file.buffer) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'course_icons',
              resource_type: 'image'
            },
            (err, result) => (err ? reject(err) : resolve(result))
          ).end(req.file.buffer);
        });
        iconUrl = result.secure_url;
      } else {
        iconUrl = `/uploads/course_icons/${req.file.originalname}`;
      }
    }

    const featuresString = Array.isArray(features)
      ? features.join(',')
      : features;

    await db.query(
      `UPDATE courses 
       SET icon=?, title=?, description=?, full_description=?, duration=?, level=?, features=? 
       WHERE id=?`,
      [
        iconUrl,
        title,
        description,
        full_description,
        duration,
        level,
        featuresString,
        req.params.id
      ]
    );

    res.json({ message: 'Course updated!', icon: iconUrl });

  } catch (err) {
    console.error('PUT course error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE course
router.delete('/:id', async (req, res) => {
  const [result] = await db.query('DELETE FROM courses WHERE id=?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Course not found' });
  res.json({ message: 'Course deleted!' });
});

export default router;
