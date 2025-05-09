import React from 'react';
import { Filter } from 'lucide-react';

export const SearchBar = ({ searchTerm, onSearchChange, selectedLevel, onLevelChange, onScrollToTop }) => (
    <div className="flex gap-4 mb-6 items-center">
        <div className="flex-1">
            <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search logs..."
                    className="w-full pl-10 pr-4 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchTerm}
                    onChange={onSearchChange}
                />
            </div>
        </div>

        <select
            className="border rounded px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            value={selectedLevel}
            onChange={onLevelChange}
        >
            <option value="all">All Levels</option>
            <option value="Notice">Notice</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
            <option value="Info">Info</option>
        </select>

        {onScrollToTop && (
            <button
                onClick={onScrollToTop}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Go to top
            </button>
        )}
    </div>
);
