import { useState, useRef } from 'react';
import { PlayCircle, Plus, X, Clock, Edit2, Save } from 'lucide-react';

const VideoSection = ({ videos, addVideo, removeVideo, videoNotes, addVideoNote, removeVideoNote }) => {
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newTimestamp, setNewTimestamp] = useState('0:00');
  const [newSeconds, setNewSeconds] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  // Create a ref to store iframe references
  const iframeRefs = useRef([]);

  const handleAddVideo = () => {
    if (newVideoUrl.trim()) {
      addVideo(newVideoUrl);
      setNewVideoUrl('');
      // Add a new ref for the new iframe
      iframeRefs.current.push(null);
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getEmbedUrl = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1` : url;
  };

  const parseTimestamp = (timestamp) => {
    // Parse timestamp like "2:30" or "1:45:30"
    const parts = timestamp.split(':').map(Number);
    let seconds = 0;
    
    if (parts.length === 3) { // h:mm:ss
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // mm:ss
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) { // ss
      seconds = parts[0];
    }
    
    return seconds;
  };

  const formatTimestamp = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddNote = (videoIndex) => {
    if (!newNoteText.trim() || newSeconds === 0) return;
    
    addVideoNote(videoIndex, {
      timestamp: newTimestamp,
      seconds: newSeconds,
      note: newNoteText.trim()
    });
    
    setNewNoteText('');
    setNewTimestamp('0:00');
    setNewSeconds(0);
    setIsAddingNote(false);
    setActiveVideoIndex(null);
  };

  const handleTimestampChange = (e) => {
    const value = e.target.value;
    setNewTimestamp(value);
    setNewSeconds(parseTimestamp(value) || 0);
  };

  const handleVideoTimeClick = (videoIndex, seconds) => {
    setActiveVideoIndex(videoIndex);
    setIsAddingNote(true);
    setNewTimestamp(formatTimestamp(seconds));
    setNewSeconds(seconds);
  };

  // Function to play video at specific timestamp
  const playVideoAtTimestamp = (videoIndex, seconds) => {
    const iframe = iframeRefs.current[videoIndex];
    if (!iframe) return;
    
    try {
      // Send command to YouTube iframe API
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [seconds, true],
        id: videoIndex
      }), '*');
      
      // Also send the play command
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'playVideo',
        args: [],
        id: videoIndex
      }), '*');
      
    } catch (error) {
      console.error('Error controlling video:', error);
      
      // Fallback method - update the src with timestamp
      const videoURL = getVideoURL(videos[videoIndex]);
      const videoId = extractVideoId(videoURL);
      if (videoId) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1&enablejsapi=1`;
      }
    }
  };

  // Get video URL from video object or string
  const getVideoURL = (video) => {
    if (typeof video === 'string') return video;
    return video.videoURL || video.url || '';
  };

  // Set up iframe reference
  const setIframeRef = (index, element) => {
    iframeRefs.current[index] = element;
  };

  // Initialize iframe refs array when videos change
  useState(() => {
    iframeRefs.current = new Array(videos.length).fill(null);
  }, [videos.length]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-5">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <PlayCircle className="text-blue-600" size={16} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Videos</h3>
      </div>

      {/* Add Video Input */}
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          value={newVideoUrl}
          onChange={(e) => setNewVideoUrl(e.target.value)}
          placeholder="Paste YouTube URL here..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          onClick={handleAddVideo}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          <span>Add Video</span>
        </button>
      </div>

      {/* Video List */}
      {videos.map((video, videoIndex) => {
        const videoURL = getVideoURL(video);
        const embedUrl = getEmbedUrl(videoURL);
        const notesForVideo = videoNotes[videoIndex] || [];
        
        return (
          <div key={videoIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Video {videoIndex + 1}</span>
                <a 
                  href={videoURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-xs"
                >
                  {videoURL}
                </a>
              </div>
              <button
                onClick={() => removeVideo(videoIndex)}
                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* YouTube Embed */}
            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-100">
              <iframe
                ref={(el) => setIframeRef(videoIndex, el)}
                src={embedUrl}
                title={`Video ${videoIndex + 1}`}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                id={`youtube-iframe-${videoIndex}`}
              />
            </div>
            
            {/* Add Note Form */}
            {activeVideoIndex === videoIndex && isAddingNote && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-blue-800">Add Note at {newTimestamp}</h4>
                  <button
                    onClick={() => {
                      setIsAddingNote(false);
                      setActiveVideoIndex(null);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-blue-600" />
                    <input
                      type="text"
                      value={newTimestamp}
                      onChange={handleTimestampChange}
                      placeholder="0:00"
                      className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm w-24"
                    />
                    <span className="text-sm text-gray-600">
                      ({newSeconds} seconds)
                    </span>
                  </div>
                  
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter your note here..."
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm resize-none"
                    rows={3}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setIsAddingNote(false);
                        setActiveVideoIndex(null);
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddNote(videoIndex)}
                      disabled={!newNoteText.trim()}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={14} />
                      <span>Add Note</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Add Note Button */}
            {!isAddingNote && (
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={() => {
                    setActiveVideoIndex(videoIndex);
                    setIsAddingNote(true);
                  }}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus size={14} />
                  <span>Add Note at Current Time</span>
                </button>
                
                <span className="text-gray-400">|</span>
                
                <div className="flex space-x-1">
                  {[30, 60, 120, 300].map((seconds) => (
                    <button
                      key={seconds}
                      onClick={() => handleVideoTimeClick(videoIndex, seconds)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                    >
                      {formatTimestamp(seconds)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Video Notes Section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Notes ({notesForVideo.length})
                </h4>
              </div>
              
              {notesForVideo.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No notes yet. Click "Add Note" to add your first note.
                </div>
              ) : (
                <div className="space-y-2">
                  {notesForVideo.map((note, noteIndex) => (
                    <div key={note.id || noteIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => playVideoAtTimestamp(videoIndex, note.seconds)}
                          className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
                          title={`Play video at ${note.timestamp}`}
                        >
                          <Clock size={12} />
                          <span>{note.timestamp}</span>
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                          {note.note}
                        </p>
                      </div>
                      <button
                        onClick={() => removeVideoNote(videoIndex, note.id)}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        title="Delete note"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VideoSection;