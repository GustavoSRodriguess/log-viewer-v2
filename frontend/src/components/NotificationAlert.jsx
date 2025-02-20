import React, { useCallback, useEffect, useRef, useState } from 'react'
import { API_URL } from '../config';
import { playNotification } from '../utils/notification';
import { PauseCircle, Repeat, Volume2, VolumeX } from 'lucide-react';

export const NotificationAlert = ({ selectedFile, parseLog, setLogs }) => {
    const [newLogsCount, setNewLogsCount] = useState(0);
    const previusLogRef = useRef([]);
    const refreshInternalRef = useRef(null);
    const [autoRefresh, setAutoRefresh] = useState(() => {
        return localStorage.getItem('autoRefresh') === 'true'
    });
    const [notifyNewLogs, setNotifyNewLogs] = useState(() => {
        return localStorage.getItem('notifyNewLogs') !== 'false'
    });

    const checkNewLogs = useCallback(async () => {
        if (!selectedFile) return;
        try {
            const response = await fetch(`${API_URL}/api/logs/${selectedFile}`);
            const content = await response.text();
            const parsedLogs = parseLog(content);

            // Verifica se há novos logs e se já temos logs anteriores
            if (previusLogRef.current.length > 0 && parsedLogs.length > previusLogRef.current.length) {
                const newCount = parsedLogs.length - previusLogRef.current.length;
                setNewLogsCount(prev => prev + newCount);

                // Só toca a notificação se estiver habilitada E se houver novos logs
                if (notifyNewLogs && newCount > 0) {
                    await playNotification();
                }
            }

            previusLogRef.current = parsedLogs;
            setLogs(parsedLogs);
        } catch (e) {
            console.error('Erro ao buscar logs:', e);
            setAutoRefresh(false);
        }
    }, [selectedFile, notifyNewLogs, parseLog, setLogs]);

    // Reseta o contador quando muda de arquivo
    useEffect(() => {
        setNewLogsCount(0);
        previusLogRef.current = [];
    }, [selectedFile]);

    useEffect(() => {
        if (autoRefresh) {
            refreshInternalRef.current = setInterval(checkNewLogs, 5000);
        } else {
            if (refreshInternalRef.current) {
                clearInterval(refreshInternalRef.current);
            }
        }

        return () => {
            if (refreshInternalRef.current) {
                clearInterval(refreshInternalRef.current);
            }
        }
    }, [autoRefresh, checkNewLogs]);

    useEffect(() => {
        localStorage.setItem('autoRefresh', autoRefresh);
    }, [autoRefresh]);

    useEffect(() => {
        localStorage.setItem('notifyNewLogs', notifyNewLogs);
    }, [notifyNewLogs]);

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative
                    ${autoRefresh
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
            >
                {autoRefresh ? (
                    <PauseCircle className="w-4 h-4" />
                ) : (
                    <Repeat className="w-4 h-4" />
                )}
                {newLogsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {newLogsCount}
                    </span>
                )}
            </button>

            <button
                onClick={() => setNotifyNewLogs(!notifyNewLogs)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                    ${notifyNewLogs
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
            >
                {notifyNewLogs ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
        </div>
    )
}