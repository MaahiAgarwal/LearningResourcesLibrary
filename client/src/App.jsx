import './App.css'
import NoteContent from './components/NoteContent';
import Welcome from './components/Welcome';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { notesAPI } from './services/api';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAllNotes();
      if (response.success) {
        // Transform backend data to frontend format
        const transformedNotes = response.data.map(note => ({
          id: note._id,
          title: note.title,
          date: new Date(note.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          videos: note.videos || [],
          videoNotes: note.videos?.map(video => video.notes || []) || [],
          notes: note.notesContent?.text || '',
          canvas: note.canvas?.canvasData || null,
          images: note.notesContent?.images || [],
          audioRecordings: note.notesContent?.audioRecordings || [],
          canvasImages: note.canvas?.images || []
        }));
        setNotes(transformedNotes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const addNote = async () => {
    const newNoteData = {
      title: `New Note ${notes.length + 1}`,
      videos: [],
      notesContent: { text: '' },
      canvas: { canvasData: '', images: [] }
    };

    try {
      const response = await notesAPI.createNote(newNoteData);
      if (response.success) {
        const newNote = {
          id: response.data._id,
          title: response.data.title,
          date: new Date(response.data.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          videos: response.data.videos || [],
          videoNotes: response.data.videos?.map(video => video.notes || []) || [],
          notes: response.data.notesContent?.text || '',
          canvas: response.data.canvas?.canvasData || null,
          images: response.data.notesContent?.images || [],
          audioRecordings: response.data.notesContent?.audioRecordings || [],
          canvasImages: response.data.canvas?.images || []
        };
        
        setNotes([...notes, newNote]);
        setSelectedNoteId(newNote.id);
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await notesAPI.deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const selectNote = (id) => {
    setSelectedNoteId(id);
    setIsSidebarOpen(false);
  };

  const updateNote = async (updatedNote) => {
  // Prepare data for backend - Ensure it matches backend schema
  const backendNoteData = {
    title: updatedNote.title,
    videos: updatedNote.videos?.map((video, index) => {
      // Handle both formats: video object or string URL
      const videoURL = typeof video === 'string' ? video : video.videoURL;
      const videoNotes = updatedNote.videoNotes?.[index] || [];
      
      return {
        videoURL: videoURL,
        notes: videoNotes.map(note => ({
          timestamp: note.timestamp || '0:00',
          seconds: note.seconds || 0,
          note: note.note || ''
        }))
      };
    }) || [],
    notesContent: {
      text: updatedNote.notes || '',
      images: updatedNote.images || [],
      audioRecordings: updatedNote.audioRecordings || []
    },
    canvas: {
      canvasData: updatedNote.canvas || '',
      images: updatedNote.canvasImages || []
    }
  };

    try {
    // First update local state for immediate UI feedback
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    
    // Then sync with backend
    await notesAPI.updateNote(updatedNote.id, backendNoteData);
    
    console.log('Note updated successfully');
  } catch (error) {
    console.error('Error updating note:', error);
    // Revert local state if backend update fails
    fetchNotes(); // Refetch to get correct state
  }
  };

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        notes={notes}
        selectNote={selectNote}
        selectedNoteId={selectedNoteId}
        addNote={addNote}
        deleteNote={deleteNote}
      />
      
      <button
        onClick={toggleSidebar}
        className="fixed top-24 left-4 z-10 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-lg shadow-md border border-gray-200 transition-colors"
      >
        <Menu size={20} />
      </button>
      
      <main className="transition-all duration-300">
        {selectedNote ? (
          <div className="max-w-6xl mx-auto py-8">
            <NoteContent note={selectedNote} updateNote={updateNote} />
          </div>
        ) : (
          <Welcome openSidebar={() => setIsSidebarOpen(true)} />
        )}
      </main>
    </div>
  );
};

export default App;