import express from 'express';
import { 
  createNote, 
  getAllNotes, 
  getNoteById, 
  updateNote, 
  deleteNote, 
  uploadFiles 
} from '../controllers/notes.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Create a new note (with file uploads)
router.post(
  '/',
  upload.fields([
    { name: 'notesImages', maxCount: 10 },
    { name: 'audioRecordings', maxCount: 5 },
    { name: 'canvasImages', maxCount: 5 }
  ]),
  createNote
);

// Get all notes
router.get('/', getAllNotes);

// Get a single note by ID
router.get('/:id', getNoteById);

// Update a note (with optional file uploads)
router.put(
  '/:id',
  upload.fields([
    { name: 'notesImages', maxCount: 10 },
    { name: 'audioRecordings', maxCount: 5 },
    { name: 'canvasImages', maxCount: 5 }
  ]),
  updateNote
);

// Delete a note
router.delete('/:id', deleteNote);

// Upload files separately
router.post(
  '/upload',
  upload.fields([
    { name: 'notesImages', maxCount: 10 },
    { name: 'audioRecordings', maxCount: 5 },
    { name: 'canvasImages', maxCount: 5 }
  ]),
  uploadFiles
);

export default router;