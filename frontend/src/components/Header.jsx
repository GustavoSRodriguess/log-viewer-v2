import React from 'react';
import { AlertTriangle, RefreshCcw, Trash2 } from 'lucide-react';

export const Header = ({ onClearAll, onRefresh, onDeleteOld }) => (
    <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
            <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                <AlertTriangle className="w-4 h-4" />
                Clear All Logs
            </button>
            <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                <RefreshCcw className="w-4 h-4" />
                Refresh
            </button>
            <button
                onClick={onDeleteOld}
                className='flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600'
            >
                <Trash2 className='w-4 h-4' />
                Clear Old Logs
            </button>
        </div>
    </div>
);