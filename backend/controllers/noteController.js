const Note = require('../models/Note');
const Lead = require('../models/Lead');

// @desc    Get all notes for a lead
// @route   GET /api/notes/lead/:leadId
const getNotesByLead = async (req, res) => {
  try {
    // Verify the lead belongs to the user's org
    const lead = await Lead.findOne({
      _id: req.params.leadId,
      organizationId: req.user.organizationId,
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const notes = await Note.find({
      leadId: req.params.leadId,
      organizationId: req.user.organizationId,
    })
      .populate('createdBy', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a note
// @route   POST /api/notes
const createNote = async (req, res) => {
  try {
    const { leadId, content } = req.body;

    const lead = await Lead.findOne({ _id: leadId, organizationId: req.user.organizationId });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const note = await Note.create({
      leadId,
      content,
      organizationId: req.user.organizationId,
      createdBy: req.user._id,
    });

    await note.populate('createdBy', 'name avatarUrl');
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotesByLead, createNote, deleteNote };
