import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const LogEntry = ({ log, index, isExpanded, onToggleExpand }) => {
    const hasCollapsibleContent = log.hasStack || log.hasArray;

    const getDisplayMessage = () => {
        if (log.hasArray && !isExpanded) {
            const firstLine = log.message.split('\n')[0];
            return `${firstLine} [...]`;
        }
        return log.message;
    };

    return (
        <div
            className={`p-4 rounded border ${log.level === 'Error'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : log.level === 'Warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : log.level === 'Notice'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{log.timestamp}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${log.level === 'Error'
                            ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : log.level === 'Warning'
                                ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : log.level === 'Notice'
                                    ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}>
                            {log.level}
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        {hasCollapsibleContent && (
                            <button
                                onClick={() => onToggleExpand(index)}
                                className="mt-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {isExpanded ?
                                    <ChevronDown className="w-4 h-4" /> :
                                    <ChevronRight className="w-4 h-4" />
                                }
                            </button>
                        )}
                        <div className="flex-1">
                            <pre className="text-sm whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">
                                {getDisplayMessage()}
                            </pre>
                            {log.hasArray && isExpanded && log.arrayData && (
                                <pre className="text-sm whitespace-pre-wrap break-words mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                                    {log.arrayData}
                                </pre>
                            )}
                            {log.hasStack && isExpanded && log.stackTrace && log.stackTrace.length > 0 && (
                                <pre className="text-sm whitespace-pre-wrap break-words mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                                    {log.stackTrace.join('\n')}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
