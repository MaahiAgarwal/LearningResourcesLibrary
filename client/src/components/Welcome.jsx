import { Plus, Book } from 'lucide-react';

const Welcome = ({ openSidebar }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-white">
      <div className="text-center px-6 max-w-2xl">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-4">
            <Book className="text-blue-600" size={40} />
          </div>
        </div>
        <h2 className="text-4xl font-semibold text-gray-900 mb-3">
          Welcome to Your Learning Library
        </h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Create organized notes with video resources, written content, and visual diagrams all in one place
        </p>
        <button
          onClick={openSidebar}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow transition-all"
        >
          <Plus size={20} />
          <span>Create Your First Note</span>
        </button>
      </div>
    </div>
  );
};

export default Welcome;