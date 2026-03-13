const express = require('express');
const router = express.Router();
const { getNotesByLead, createNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.get('/lead/:leadId', protect, getNotesByLead);
router.post('/', protect, createNote);
router.delete('/:id', protect, deleteNote);

module.exports = router;
