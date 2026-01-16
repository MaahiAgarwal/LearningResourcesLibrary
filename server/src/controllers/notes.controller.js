import { Note } from "../models/notes.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const createNote = async (req, res) => {
  try {
    const { title, videos, notesContent, canvas } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    const files = req?.files || {};
    const videoNotes = [];

    // Process videos if provided (videos can be string or object)
    if (videos) {
      try {
        const parsedVideos = typeof videos === 'string' ? JSON.parse(videos) : videos;
        
        if (Array.isArray(parsedVideos)) {
          for (const video of parsedVideos) {
            // Handle both formats: string URL or object
            const videoURL = typeof video === 'string' ? video : video.videoURL;
            const videoNotesArray = video.notes || [];
            
            if (videoURL) {
              const videoId = extractVideoId(videoURL);
              
              videoNotes.push({
                videoId,
                videoURL,
                notes: videoNotesArray.map(note => ({
                  timestamp: note.timestamp || '0:00',
                  seconds: note.seconds || 0,
                  note: note.note || ''
                }))
              });
            }
          }
        }
      } catch (error) {
        console.log('Error parsing videos:', error);
      }
    }

    // Initialize arrays for uploaded files
    const uploadedNotesImages = [];
    const uploadedAudioRecordings = [];
    const uploadedCanvasImages = [];

    // Process notes images (await uploads)
    if (files.notesImages && Array.isArray(files.notesImages)) {
      for (const image of files.notesImages) {
        const result = await uploadOnCloudinary(image.path, "notesImages");
        if (result) {
          uploadedNotesImages.push({
            url: result.secure_url || result.url,
            name: image.originalname
          });
        }
      }
    }

    // Process audio recordings (await uploads)
    if (files.audioRecordings && Array.isArray(files.audioRecordings)) {
      for (const audio of files.audioRecordings) {
        const result = await uploadOnCloudinary(audio.path, "audioRecordings");
        if (result) {
          uploadedAudioRecordings.push({
            url: result.secure_url || result.url,
            duration: audio.duration || 0
          });
        }
      }
    }

    // Process canvas images (await uploads)
    if (files.canvasImages && Array.isArray(files.canvasImages)) {
      for (const canvasImage of files.canvasImages) {
        const result = await uploadOnCloudinary(canvasImage.path, "canvasImages");
        if (result) {
          uploadedCanvasImages.push({
            url: result.secure_url || result.url,
            x: 0,  // Default position
            y: 0,  // Default position
            width: 100,  // Default size
            height: 100   // Default size
          });
        }
      }
    }

    // Parse canvas data from request body
    let canvasData = "";
    let canvasImages = uploadedCanvasImages;
    
    if (canvas) {
      try {
        const parsedCanvas = typeof canvas === 'string' ? JSON.parse(canvas) : canvas;
        
        if (parsedCanvas.canvasData) {
          canvasData = parsedCanvas.canvasData;
        }
        
        if (parsedCanvas.images && Array.isArray(parsedCanvas.images)) {
          // Merge uploaded images with existing ones
          canvasImages = [...parsedCanvas.images, ...uploadedCanvasImages];
        }
      } catch (error) {
        console.log('Error parsing canvas:', error);
        if (canvas.canvasData) {
          canvasData = canvas.canvasData;
        }
      }
    }

    // Parse notes content
    let notesText = "";
    let notesImages = uploadedNotesImages;
    let audioRecordings = uploadedAudioRecordings;
    
    if (notesContent) {
      try {
        const parsedNotesContent = typeof notesContent === 'string' ? JSON.parse(notesContent) : notesContent;
        
        if (parsedNotesContent.text) {
          notesText = parsedNotesContent.text;
        }
        
        if (parsedNotesContent.images && Array.isArray(parsedNotesContent.images)) {
          notesImages = [...parsedNotesContent.images, ...uploadedNotesImages];
        }
        
        if (parsedNotesContent.audioRecordings && Array.isArray(parsedNotesContent.audioRecordings)) {
          audioRecordings = [...parsedNotesContent.audioRecordings, ...uploadedAudioRecordings];
        }
      } catch (error) {
        console.log('Error parsing notes content:', error);
        if (notesContent.text) {
          notesText = notesContent.text;
        }
      }
    }

    // Create the note document
    const newNote = new Note({
      title,
      videos: videoNotes,
      notesContent: {
        text: notesText,
        images: notesImages,
        audioRecordings: audioRecordings
      },
      canvas: {
        canvasData: canvasData,
        images: canvasImages
      }
    });

    await newNote.save();

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: newNote
    });

  } catch (error) {
    console.log('Error creating note:', error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating note",
      error: error.message
    });
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .sort({ updatedAt: -1 }) // Most recently updated first

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });

  } catch (error) {
    console.error("Error fetching notes:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notes",
      error: error.message
    });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Note ID is required"
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: note
    });

  } catch (error) {
    console.error("Error fetching note:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching note",
      error: error.message
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videos, notesContent, canvas } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Note ID is required"
      });
    }

    // Find the existing note
    const existingNote = await Note.findById(id);
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    const files = req?.files || {};
    let videoNotes = existingNote.videos || [];

    // Process videos if provided
    if (videos) {
      try {
        const parsedVideos = typeof videos === 'string' ? JSON.parse(videos) : videos;
        
        if (Array.isArray(parsedVideos)) {
          videoNotes = [];
          
          for (const video of parsedVideos) {
            // Handle both formats: string URL or object
            const videoURL = typeof video === 'string' ? video : video.videoURL;
            const videoNotesArray = video.notes || [];
            
            if (videoURL) {
              const videoId = extractVideoId(videoURL);
              
              videoNotes.push({
                videoId,
                videoURL,
                notes: videoNotesArray.map(note => ({
                  timestamp: note.timestamp || '0:00',
                  seconds: note.seconds || 0,
                  note: note.note || ''
                }))
              });
            }
          }
        }
      } catch (error) {
        console.log('Error parsing videos in update:', error);
      }
    }

    // Start with existing files
    let uploadedNotesImages = [...existingNote.notesContent.images];
    let uploadedAudioRecordings = [...existingNote.notesContent.audioRecordings];
    let uploadedCanvasImages = [...existingNote.canvas.images];

    // Process new notes images (await uploads)
    if (files.notesImages && Array.isArray(files.notesImages)) {
      for (const image of files.notesImages) {
        const result = await uploadOnCloudinary(image.path, "notesImages");
        if (result) {
          uploadedNotesImages.push({
            url: result.secure_url || result.url,
            name: image.originalname
          });
        }
      }
    }

    // Process new audio recordings (await uploads)
    if (files.audioRecordings && Array.isArray(files.audioRecordings)) {
      for (const audio of files.audioRecordings) {
        const result = await uploadOnCloudinary(audio.path, "audioRecordings");
        if (result) {
          uploadedAudioRecordings.push({
            url: result.secure_url || result.url,
            duration: audio.duration || 0
          });
        }
      }
    }

    // Process new canvas images (await uploads)
    if (files.canvasImages && Array.isArray(files.canvasImages)) {
      for (const canvasImage of files.canvasImages) {
        const result = await uploadOnCloudinary(canvasImage.path, "canvasImages");
        if (result) {
          uploadedCanvasImages.push({
            url: result.secure_url || result.url,
            x: 0,
            y: 0,
            width: 100,
            height: 100
          });
        }
      }
    }

    // Parse canvas data from request body
    let canvasData = existingNote.canvas.canvasData;
    
    if (canvas) {
      try {
        const parsedCanvas = typeof canvas === 'string' ? JSON.parse(canvas) : canvas;
        
        if (parsedCanvas.canvasData) {
          canvasData = parsedCanvas.canvasData;
        }
        
        if (parsedCanvas.images && Array.isArray(parsedCanvas.images)) {
          // Replace with new images array
          uploadedCanvasImages = parsedCanvas.images;
        }
      } catch (error) {
        console.log('Error parsing canvas in update:', error);
        if (canvas.canvasData) {
          canvasData = canvas.canvasData;
        }
      }
    }

    // Parse notes content
    let notesText = existingNote.notesContent.text;
    
    if (notesContent) {
      try {
        const parsedNotesContent = typeof notesContent === 'string' ? JSON.parse(notesContent) : notesContent;
        
        if (parsedNotesContent.text !== undefined) {
          notesText = parsedNotesContent.text;
        }
        
        if (parsedNotesContent.images && Array.isArray(parsedNotesContent.images)) {
          uploadedNotesImages = parsedNotesContent.images;
        }
        
        if (parsedNotesContent.audioRecordings && Array.isArray(parsedNotesContent.audioRecordings)) {
          uploadedAudioRecordings = parsedNotesContent.audioRecordings;
        }
      } catch (error) {
        console.log('Error parsing notes content in update:', error);
        if (notesContent.text !== undefined) {
          notesText = notesContent.text;
        }
      }
    }

    // Update the note document
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        title: title || existingNote.title,
        videos: videoNotes,
        notesContent: {
          text: notesText,
          images: uploadedNotesImages,
          audioRecordings: uploadedAudioRecordings
        },
        canvas: {
          canvasData: canvasData,
          images: uploadedCanvasImages
        }
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: updatedNote
    });

  } catch (error) {
    console.log('Error updating note:', error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating note",
      error: error.message
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Note ID is required"
      });
    }

    const note = await Note.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: note
    });

  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting note",
      error: error.message
    });
  }
};

export const uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    const uploadedFiles = [];

    if (files?.notesImages && Array.isArray(files.notesImages)) {
      for (const file of files.notesImages) {
        const result = await uploadOnCloudinary(file.path);
        if (result) {
          uploadedFiles.push({
            url: result.secure_url || result.url,
            name: file.originalname
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: uploadedFiles
    });

  } catch (error) {
    console.error("Error uploading files:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading files",
      error: error.message
    });
  }
};