import express from 'express';
import pool from '../db.js';
import { sendInterviewEmail } from '../utils/emailService.js';

const router = express.Router();

/**
 * Schedule an interview
 * POST /api/interviews/schedule
 */
router.post('/schedule', async (req, res) => {
<<<<<<< HEAD
  console.log(`[POST /api/interviews/schedule] Incoming request`);
=======
  console.log(`[POST /api/interviews/schedule] Request received`);
>>>>>>> origin/main
  console.log(`[POST /api/interviews/schedule] Request body:`, req.body);
  try {
    const { userId, email, full_name, interviewDate, interviewTime, meetingLink, description } = req.body;

    if (!userId || !email || !full_name || !interviewDate || !interviewTime || !meetingLink || !description) {
      console.warn(`[POST /api/interviews/schedule] Validation failed: missing fields`);
      return res.status(400).json({ success: false, error: 'Validation failed. All fields are required.' });
    }

<<<<<<< HEAD
=======
    // Server-side Date/Time validation
    const now = new Date();
    const serverYear = now.getFullYear();
    const serverMonth = String(now.getMonth() + 1).padStart(2, '0');
    const serverDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${serverYear}-${serverMonth}-${serverDay}`;

    if (interviewDate < todayStr) {
      console.warn(`[POST /api/interviews/schedule] Validation failed: past date`);
      return res.status(400).json({ success: false, error: 'Interview date and time must be in the future.' });
    }

    if (interviewDate === todayStr) {
      const [hours, minutes] = interviewTime.split(':');
      const interviewDateObj = new Date();
      interviewDateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      if (interviewDateObj < now) {
        console.warn(`[POST /api/interviews/schedule] Validation failed: past time today`);
        return res.status(400).json({ success: false, error: 'Interview date and time must be in the future.' });
      }
    }

>>>>>>> origin/main
    // Check for existing scheduled interview for this user
    console.log(`[POST /api/interviews/schedule] Database query: Checking existing interviews for userId=${userId}`);
    const [existing] = await pool.query(
      'SELECT id FROM interviews WHERE userId = ? AND status = ?',
      [userId, 'Scheduled']
    );
    console.log(`[POST /api/interviews/schedule] Rows found: ${existing.length}`);

    if (existing && existing.length > 0) {
      console.warn(`[POST /api/interviews/schedule] Conflict: Interview already scheduled`);
      return res.status(409).json({ success: false, error: 'An interview has already been scheduled for this candidate.' });
    }

    // Insert new interview record
    console.log(`[POST /api/interviews/schedule] Database query: Inserting new interview`);
    const [result] = await pool.query(
      `INSERT INTO interviews (userId, interviewDate, interviewTime, meetingLink, description, status) 
       VALUES (?, ?, ?, ?, ?, 'Scheduled')`,
      [userId, interviewDate, interviewTime, meetingLink, description]
    );
<<<<<<< HEAD
    console.log(`[POST /api/interviews/schedule] Interview saved with ID: ${result.insertId}`);

    // Send email
    try {
      console.log(`[POST /api/interviews/schedule] Triggering email delivery`);
=======
    console.log(`[POST /api/interviews/schedule] Interview saved`);

    // Send email
    try {
      console.log(`[POST /api/interviews/schedule] Candidate email: ${email}`);
      console.log(`[POST /api/interviews/schedule] Email sending started`);
>>>>>>> origin/main
      await sendInterviewEmail({
        email,
        full_name,
        interviewDate,
        interviewTime,
        meetingLink,
        description
      });
      console.log(`[POST /api/interviews/schedule] Email sent successfully`);
<<<<<<< HEAD
    } catch (emailError) {
      console.error(`[POST /api/interviews/schedule] Email sending failed:`, emailError);
    }

    const responseJson = { success: true, message: 'Interview invitation sent successfully.', interviewId: result.insertId };
    console.log(`[POST /api/interviews/schedule] Returned JSON:`, responseJson);
    res.status(201).json(responseJson);
=======
      
      const responseJson = { success: true, message: 'Interview invitation sent successfully.', interviewId: result.insertId };
      console.log(`[POST /api/interviews/schedule] Returned JSON:`, responseJson);
      return res.status(201).json(responseJson);
    } catch (emailError) {
      console.error(`[POST /api/interviews/schedule] Email sending failed:`, emailError);
      return res.status(500).json({ 
        success: false, 
        error: 'Interview saved, but email sending failed. ' + (emailError.message || 'Check email configuration.') 
      });
    }
>>>>>>> origin/main
  } catch (err) {
    console.error(`[POST /api/interviews/schedule] ❌ Internal server error:`, err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * Get interview history for a specific user
 * GET /api/interviews/:userId
 */
router.get('/:userId', async (req, res) => {
  console.log(`[GET /api/interviews/:userId] Incoming request for userId: ${req.params.userId}`);
  try {
    const { userId } = req.params;
    
    if (!userId) {
      console.warn(`[GET /api/interviews/:userId] Missing userId`);
      return res.status(400).json({ success: false, error: 'UserId is required.' });
    }

    console.log(`[GET /api/interviews/:userId] Database query: Fetching interviews`);
    const [interviews] = await pool.query(
      'SELECT * FROM interviews WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    console.log(`[GET /api/interviews/:userId] Rows found: ${interviews.length}`);

    const responseJson = { success: true, history: interviews || [] };
    console.log(`[GET /api/interviews/:userId] Returned JSON length:`, responseJson.history.length);
    res.json(responseJson);
  } catch (err) {
    console.error(`[GET /api/interviews/:userId] ❌ Internal server error:`, err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * Update interview status
 * PUT /api/interviews/:id
 */
router.put('/:id', async (req, res) => {
  console.log(`[PUT /api/interviews/:id] Incoming request id: ${req.params.id}, body:`, req.body);
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    console.log(`[PUT /api/interviews/:id] Database query: Updating status`);
    await pool.query(
      'UPDATE interviews SET status = ? WHERE id = ?',
      [status, id]
    );
    console.log(`[PUT /api/interviews/:id] Status updated successfully`);

    res.json({ success: true, message: 'Interview updated successfully.' });
  } catch (err) {
    console.error(`[PUT /api/interviews/:id] ❌ Internal server error:`, err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

export default router;
