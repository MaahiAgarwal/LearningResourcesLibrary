import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Adjust based on your backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const notesAPI = {
  // Get all notes
  getAllNotes: async () => {
    try {
      const response = await api.get('/notes');
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  // Get a single note by ID
  getNoteById: async (id) => {
    try {
      const response = await api.get(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  },

  createNote: async (noteData, files) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', noteData.title || 'Untitled Note');
    
    // Stringify complex objects
    if (noteData.videos && noteData.videos.length > 0) {
      formData.append('videos', JSON.stringify(noteData.videos));
    } else {
      formData.append('videos', JSON.stringify([]));
    }
    
    if (noteData.notesContent) {
      formData.append('notesContent', JSON.stringify(noteData.notesContent));
    } else {
      formData.append('notesContent', JSON.stringify({ text: '' }));
    }
    
    if (noteData.canvas) {
      formData.append('canvas', JSON.stringify(noteData.canvas));
    } else {
      formData.append('canvas', JSON.stringify({ canvasData: '', images: [] }));
    }
    
    // Add files
    if (files && files.notesImages) {
      files.notesImages.forEach((file, index) => {
        formData.append('notesImages', file);
      });
    }
    
    if (files && files.audioRecordings) {
      files.audioRecordings.forEach((file, index) => {
        formData.append('audioRecordings', file);
      });
    }
    
    if (files && files.canvasImages) {
      files.canvasImages.forEach((file, index) => {
        formData.append('canvasImages', file);
      });
    }
    
    const response = await api.post('/notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
},

// Update a note
updateNote: async (id, noteData, files) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', noteData.title || 'Untitled Note');
    
    // Stringify complex objects
    if (noteData.videos) {
      formData.append('videos', JSON.stringify(noteData.videos));
    } else {
      formData.append('videos', JSON.stringify([]));
    }
    
    if (noteData.notesContent) {
      formData.append('notesContent', JSON.stringify(noteData.notesContent));
    } else {
      formData.append('notesContent', JSON.stringify({ text: '', images: [], audioRecordings: [] }));
    }
    
    if (noteData.canvas) {
      formData.append('canvas', JSON.stringify(noteData.canvas));
    } else {
      formData.append('canvas', JSON.stringify({ canvasData: '', images: [] }));
    }
    
    // Add files (only new files should be sent)
    if (files && files.notesImages) {
      files.notesImages.forEach((file, index) => {
        formData.append('notesImages', file);
      });
    }
    
    if (files && files.audioRecordings) {
      files.audioRecordings.forEach((file, index) => {
        formData.append('audioRecordings', file);
      });
    }
    
    if (files && files.canvasImages) {
      files.canvasImages.forEach((file, index) => {
        formData.append('canvasImages', file);
      });
    }
    
    const response = await api.put(`/notes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
},

  // Delete a note
  deleteNote: async (id) => {
    try {
      const response = await api.delete(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Upload files separately
  uploadFiles: async (files) => {
    try {
      const formData = new FormData();
      
      if (files.notesImages) {
        files.notesImages.forEach((file) => {
          formData.append('notesImages', file);
        });
      }
      
      if (files.audioRecordings) {
        files.audioRecordings.forEach((file) => {
          formData.append('audioRecordings', file);
        });
      }
      
      if (files.canvasImages) {
        files.canvasImages.forEach((file) => {
          formData.append('canvasImages', file);
        });
      }
      
      const response = await api.post('/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  },
};

export default api;