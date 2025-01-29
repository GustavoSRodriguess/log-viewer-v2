import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const LogEntry = ({ log, index, isExpanded, onToggleExpand }) => (
    <div
        className={`p-4 rounded border ${log.level === 'Error' ? 'bg-red-50 border-red-200' :
                log.level === 'Warning' ? 'bg-yellow-50 border-yellow-200' :
                    log.level === 'Notice' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
            }`}
    >
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">{log.timestamp}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${log.level === 'Error' ? 'bg-red-200 text-red-800' :
                            log.level === 'Warning' ? 'bg-yellow-200 text-yellow-800' :
                                log.level === 'Notice' ? 'bg-blue-200 text-blue-800' :
                                    'bg-gray-200 text-gray-800'
                        }`}>
                        {log.level}
                    </span>
                </div>
                <div className="flex items-start gap-2">
                    {log.hasStack && (
                        <button
                            onClick={() => onToggleExpand(index)}
                            className="mt-1 text-gray-500 hover:text-gray-700"
                        >
                            {isExpanded ?
                                <ChevronDown className="w-4 h-4" /> :
                                <ChevronRight className="w-4 h-4" />
                            }
                        </button>
                    )}
                    <div className="flex-1">
                        <pre className="text-sm whitespace-pre-wrap break-words">{log.message}</pre>
                        {log.hasStack && isExpanded && (
                            <pre className="text-sm whitespace-pre-wrap break-words mt-2 pl-4 border-l-2 border-gray-300 text-gray-600">
                                {log.stackTrace.join('\n')}
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
