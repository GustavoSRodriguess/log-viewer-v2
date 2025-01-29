import React from 'react';
import { Filter } from 'lucide-react';

export const SearchBar = ({ searchTerm, onSearchChange, selectedLevel, onLevelChange }) => (
    <div className="flex gap-4 mb-6">
        <div className="flex-1">
            <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search logs..."
                    className="w-full pl-10 pr-4 py-2 border rounded"
                    value={searchTerm}
                    onChange={onSearchChange}
                />
            </div>
        </div>
        <select
            className="border rounded px-4 py-2"
            value={selectedLevel}
            onChange={onLevelChange}
        >
            <option value="all">All Levels</option>
            <option value="Notice">Notice</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
            <option value="Info">Info</option>
        </select>
    </div>
);