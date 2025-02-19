import React from 'react';
import { FileText, Trash2 } from 'lucide-react';

export const LogFile = ({ file, isSelected, onSelect, onDelete }) => (
    <div className="flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
        <button
            onClick={() => onSelect(file)}
            className={`flex items-center gap-1 flex-1 text-left ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}
        >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{file.split('/').pop().split('.')[0]}</span>
        </button>
        <button
            onClick={() => onDelete(file)}
            className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
);