import { X, Plus, Trash2, ChevronRight } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, notes, selectNote, selectedNoteId, addNote, deleteNote }) => {
  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Notes</h2>
            <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {notes.map(note => (
              <div key={note.id} className="group relative">
                <button
                  onClick={() => selectNote(note.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between ${
                    selectedNoteId === note.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{note.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{note.date}</div>
                  </div>
                  {selectedNoteId === note.id && <ChevronRight size={16} className="text-blue-600 ml-2" />}
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={addNote}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
            >
              <Plus size={18} />
              <span>New Note</span>
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 z-20 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;