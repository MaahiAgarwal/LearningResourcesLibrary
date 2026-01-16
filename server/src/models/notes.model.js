import mongoose from "mongoose";

// Video timestamp note schema
const videoNoteSchema = new mongoose.Schema({
  timestamp: {
    type: String,  // "2:30" format
    required: true
  },
  seconds: {
    type: Number,  // 150 for calculations
    required: true
  },
  note: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Individual video with its notes
const videoContentSchema = new mongoose.Schema({
  videoId: {
    type: String,  // YouTube video ID
    required: true
  },
  videoURL: {
    type: String,
    required: true
  },
  notes: [videoNoteSchema]  // Embedded subdocument
}, { timestamps: true });

// Image attachment schema
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  name: {
    type: String
  }
}, { timestamps: true });

// Audio recording schema
const audioRecordingSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  duration: {
    type: Number  // in seconds
  }
}, { timestamps: true });

// Canvas image schema
const canvasImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  }
});

// Main notes content schema
const notesContentSchema = new mongoose.Schema({
  text: {
    type: String,
    default: ""
  },
  images: [imageSchema],
  audioRecordings: [audioRecordingSchema]
}, { timestamps: true });

// Main note schema
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "Untitled Note"
  },
  videos: [videoContentSchema],  // Array of videos with their notes
  notesContent: notesContentSchema,  // Embedded subdocument
  canvas: {
    canvasData: String,  // Base64 canvas drawing data
    images: [canvasImageSchema]  // Images on canvas
  }
}, { timestamps: true });

// Create and export models
const Note = mongoose.model("Note", noteSchema);

export { Note };