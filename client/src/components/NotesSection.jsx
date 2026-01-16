import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';

const NotesSection = ({ content, updateContent, images, addImage, removeImage, audioRecordings, addAudioRecording, removeAudioRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const imageInputRef = useRef(null);
  const timerRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        addImage({
          id: Date.now() + Math.random(),
          url: event.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        addAudioRecording({
          id: Date.now(),
          url: url,
          duration: recordingTime
        });
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      alert('Microphone access denied. Please allow microphone access to record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-5">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <MessageSquare className="text-blue-600" size={16} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Notes & Comments</h3>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        placeholder="Write your notes, thoughts, or comments here..."
        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm mb-4"
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          <span>Add Image</span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <span className="text-lg">🎤</span>
            <span>Record Voice</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium animate-pulse"
          >
            <span className="w-3 h-3 bg-white rounded-full"></span>
            <span>Recording... {formatTime(recordingTime)}</span>
          </button>
        )}
      </div>

      {images && images.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img 
                  src={image.url} 
                  alt={image.name}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-white hover:bg-red-50 text-red-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {audioRecordings && audioRecordings.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Voice Recordings</h4>
          <div className="space-y-2">
            {audioRecordings.map((recording) => (
              <div key={recording.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <audio controls src={recording.url} className="flex-1" />
                <button
                  onClick={() => removeAudioRecording(recording.id)}
                  className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



export default NotesSection;