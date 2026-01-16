import { Book } from 'lucide-react';

// Header Component
const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Book className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Learning Resource Library</h1>
              <p className="text-sm text-gray-500">Organize and manage your study materials</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;