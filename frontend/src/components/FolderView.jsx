import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { LogFile } from './LogFile';

export const FolderView = ({ folder, files, isExpanded, onToggle, selectedFile, onSelectFile, onDeleteFile }) => (
    <div className="border rounded-lg">
        <button
            onClick={() => onToggle(folder)}
            className="w-full flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
        >
            {isExpanded ?
                <ChevronDown className="w-4 h-4" /> :
                <ChevronRight className="w-4 h-4" />
            }
            <span className="font-medium">{folder}</span>
            <span className="text-sm text-gray-500">({files.length})</span>
        </button>
        {isExpanded && (
            <div className="p-2 space-y-1">
                {files.map((file) => (
                    <LogFile
                        key={file}
                        file={file}
                        isSelected={selectedFile === file}
                        onSelect={onSelectFile}
                        onDelete={onDeleteFile}
                    />
                ))}
            </div>
        )}
    </div>
);