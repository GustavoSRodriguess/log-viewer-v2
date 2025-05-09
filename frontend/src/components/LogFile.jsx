import React from 'react';
import { FileText, Trash2 } from 'lucide-react';

const formatDate = (isoDateString) => {
    if (!isoDateString) return 'Unknown Date';
    try {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        // const year = date.getFullYear();
        // return `${day}-${month}-${year}`;
        return `${day}-${month}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
};

export const LogFile = ({ fileInfo, isSelected, onSelect, onDelete }) => {
    const displayName = fileInfo.name.split('/').pop().split('.')[0];
    const displayDate = formatDate(fileInfo.mtime);

    return (
        <div className="flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
            <button
                onClick={() => onSelect(fileInfo.name)}
                className={`flex items-center gap-1 flex-1 text-left min-w-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-grow" title={displayName}>{displayName}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0 whitespace-nowrap">{displayDate}</span>
            </button>
            <button
                onClick={() => onDelete(fileInfo.name)}
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};
