import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { LogFile } from './LogFile';

export const FolderView = ({ folder, files, isExpanded, onToggle, selectedFile, onSelectFile, onDeleteFile }) => (
    <div className="border rounded-lg bg-gray-200 dark:bg-gray-700">
        <button
            onClick={() => onToggle(folder)}
            className="w-full flex items-center gap-2 p-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
            {isExpanded ?
                <ChevronDown className="w-4 h-4" /> :
                <ChevronRight className="w-4 h-4" />
            }
            <span className="font-medium">{folder}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">({files.length})</span>
        </button>
        {isExpanded && (
            <div className="p-2 space-y-1">
                {files.map((fileInfo) => (
                    <LogFile
                        key={fileInfo.name} // Use fileInfo.name as key
                        fileInfo={fileInfo} // Pass the whole fileInfo object
                        isSelected={selectedFile === fileInfo.name} // Compare with fileInfo.name
                        onSelect={onSelectFile}
                        onDelete={onDeleteFile}
                    />
                ))}
            </div>
        )}
    </div>
);
