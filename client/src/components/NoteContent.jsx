import VideoSection from './VideoSection';
import NotesSection from './NotesSection';
import CanvasSection from './CanvasSection';

const NoteContent = ({ note, updateNote }) => {
  // Extract video URLs from note.videos (which could be objects or strings)
  const getVideoURLs = () => {
    if (!note.videos || note.videos.length === 0) return [];
    
    return note.videos.map(video => {
      if (typeof video === 'string') return video;
      return video.videoURL || '';
    });
  };

  const addVideo = (videoURL) => {
    const newVideo = {
      videoURL,
      videoId: extractVideoId(videoURL),
      notes: []
    };
    
    updateNote({
      ...note,
      videos: [...note.videos, newVideo],
      videoNotes: [...(note.videoNotes || []), []]
    });
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const removeVideo = (index) => {
    const updatedVideos = [...note.videos];
    const updatedVideoNotes = [...(note.videoNotes || [])];
    
    updatedVideos.splice(index, 1);
    updatedVideoNotes.splice(index, 1);
    
    updateNote({
      ...note,
      videos: updatedVideos,
      videoNotes: updatedVideoNotes
    });
  };

  const addVideoNote = (videoIndex, noteData) => {
  const videoNotes = note.videoNotes || [];
  const updatedVideoNotes = [...videoNotes];
  
  if (!updatedVideoNotes[videoIndex]) {
    updatedVideoNotes[videoIndex] = [];
  }
  
  updatedVideoNotes[videoIndex] = [...updatedVideoNotes[videoIndex], {
    ...noteData,
    id: Date.now() + Math.random() // Ensure ID is added
  }];
  
  updateNote({
    ...note,
    videoNotes: updatedVideoNotes
  });
};

  const removeVideoNote = (videoIndex, noteId) => {
    const videoNotes = note.videoNotes || [];
    const updatedVideoNotes = [...videoNotes];
    
    if (updatedVideoNotes[videoIndex]) {
      updatedVideoNotes[videoIndex] = updatedVideoNotes[videoIndex].filter(n => n.id !== noteId);
    }
    
    updateNote({
      ...note,
      videoNotes: updatedVideoNotes
    });
  };

  const updateNotes = (content) => {
    updateNote({
      ...note,
      notes: content
    });
  };

  const addImage = (image) => {
    updateNote({
      ...note,
      images: [...(note.images || []), {
        ...image,
        id: Date.now() + Math.random()
      }]
    });
  };

  const removeImage = (imageId) => {
    updateNote({
      ...note,
      images: note.images.filter(img => img.id !== imageId)
    });
  };

  const addAudioRecording = (recording) => {
    updateNote({
      ...note,
      audioRecordings: [...(note.audioRecordings || []), {
        ...recording,
        id: Date.now() + Math.random()
      }]
    });
  };

  const removeAudioRecording = (recordingId) => {
    updateNote({
      ...note,
      audioRecordings: note.audioRecordings.filter(rec => rec.id !== recordingId)
    });
  };

  const updateCanvas = (canvasData) => {
    updateNote({
      ...note,
      canvas: canvasData
    });
  };

  const addCanvasImage = (image) => {
    updateNote({
      ...note,
      canvasImages: [...(note.canvasImages || []), {
        ...image,
        id: Date.now() + Math.random()
      }]
    });
  };

  const removeCanvasImage = (imageId) => {
    updateNote({
      ...note,
      canvasImages: note.canvasImages.filter(img => img.id !== imageId)
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <input
          type="text"
          value={note.title}
          onChange={(e) => updateNote({ ...note, title: e.target.value })}
          className="text-3xl font-semibold text-gray-900 w-full bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400"
          placeholder="Untitled Note"
        />
        <p className="text-sm text-gray-500 mt-2">{note.date}</p>
      </div>
      
      <VideoSection
        videos={note.videos}
        addVideo={addVideo}
        removeVideo={removeVideo}
        videoNotes={note.videoNotes || []}
        addVideoNote={addVideoNote}
        removeVideoNote={removeVideoNote}
      />
      
      <NotesSection
        content={note.notes}
        updateContent={updateNotes}
        images={note.images || []}
        addImage={addImage}
        removeImage={removeImage}
        audioRecordings={note.audioRecordings || []}
        addAudioRecording={addAudioRecording}
        removeAudioRecording={removeAudioRecording}
      />
      
      <CanvasSection
        canvasData={note.canvas}
        updateCanvas={updateCanvas}
        canvasImages={note.canvasImages || []}
        addCanvasImage={addCanvasImage}
        removeCanvasImage={removeCanvasImage}
      />
    </div>
  );
};

export default NoteContent;