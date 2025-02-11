import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import { FolderView } from './FolderView';
import { LogEntry } from './LogEntry';
import { useLogParser } from '../hooks/userLogParser';
import { API_URL } from '../config';

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [logFiles, setLogFiles] = useState({
        baseclass: [],
        zarabatana: [],
        tomcat: [],
        platform: [],
        others: []
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [loading, setLoading] = useState(false);
    const [expandedLogs, setExpandedLogs] = useState({});
    const [expandedFolders, setExpandedFolders] = useState({});

    const { parseLog } = useLogParser();

    const fetchLogFiles = async () => {
        try {
            const response = await fetch(`${API_URL}/api/logs`);
            const files = await response.json();
            setLogFiles(files);
        } catch (error) {
            console.error('Error fetching log files:', error);
        }
    };

    const fetchLogContent = async (filename) => {
        setLoading(true);
        try {
            setLogs([]);
            setFilteredLogs([]);

            const response = await fetch(`${API_URL}/api/logs/${filename}`);
            const content = await response.text();
            const parsedLogs = parseLog(content);

            setLogs(parsedLogs);
            setSelectedFile(filename);
            setExpandedLogs({});
        } catch (error) {
            console.error('Error fetching log content:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearAllLogs = async () => {
        if (window.confirm('Tem certeza que deseja apagar TODOS os arquivos de log? Esta ação não pode ser desfeita.')) {
            try {
                await fetch(`${API_URL}/api/logs`, {
                    method: 'DELETE'
                });
                setSelectedFile(null);
                setLogs([]);
                setFilteredLogs([]);
                fetchLogFiles();
            } catch (error) {
                console.error('Error clearing logs:', error);
            }
        }
    };

    const deleteLog = async (filename) => {
        if (window.confirm('Tem certeza que deseja deletar este arquivo de log?')) {
            try {
                await fetch(`${API_URL}/api/logs/${filename}`, {
                    method: 'DELETE'
                });
                if (selectedFile === filename) {
                    setSelectedFile(null);
                    setLogs([]);
                    setFilteredLogs([]);
                }
                fetchLogFiles();
            } catch (error) {
                console.error('Error deleting log:', error);
            }
        }
    };

    const deleteOldLog = async () => {
        if (window.confirm('Tem certeza que deseja deletar os logs antigos?')) {
            try {
                const response = await fetch(`${API_URL}/api/logs/old`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.status === 500) {
                    throw new Error(result.error || 'Erro interno do servidor');
                }

                if (response.status === 207) {
                    const errorCount = result.errors?.length || 0;
                    alert(`Parcialmente concluído.\nArquivos deletados: ${result.deletedFiles.length}\nErros encontrados: ${errorCount}`);
                } else {
                    alert(`Deletado com sucesso ${result.deletedFiles.length} logs antigos`);
                }

                setSelectedFile(null);
                setLogs([]);
                setFilteredLogs([]);
                fetchLogFiles();
            } catch (e) {
                console.error('Erro ao limpar dados:', e);
                alert(`Ocorreu um erro ao deletar os logs antigos: ${e.message}`);
            }
        }
    };

    const toggleFolder = (folderName) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderName]: !prev[folderName]
        }));
    };

    const toggleExpand = (index) => {
        setExpandedLogs(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    useEffect(() => {
        fetchLogFiles();
    }, []);

    useEffect(() => {
        let filtered = logs;

        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.hasStack && log.stackTrace.some(line =>
                    line.toLowerCase().includes(searchTerm.toLowerCase())
                ))
            );
        }

        if (selectedLevel !== 'all') {
            filtered = filtered.filter(log => log.level === selectedLevel);
        }

        setFilteredLogs(filtered);
    }, [logs, searchTerm, selectedLevel]);

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            {/* sidebar */}
            <div className="w-80 bg-white shadow-lg flex flex-col overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Log Files</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {Object.entries(logFiles).map(([folder, files]) => (
                        <FolderView
                            key={folder}
                            folder={folder}
                            files={files}
                            isExpanded={expandedFolders[folder]}
                            onToggle={toggleFolder}
                            selectedFile={selectedFile}
                            onSelectFile={fetchLogContent}
                            onDeleteFile={deleteLog}
                        />
                    ))}
                </div>
            </div>

            {/* main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white shadow-sm p-4">
                    <Header
                        onClearAll={clearAllLogs}
                        onRefresh={fetchLogFiles}
                        onDeleteOld={deleteOldLog}
                    />
                </div>

                <div className="flex-1 overflow-hidden">
                    <div className="h-full flex flex-col p-6">
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={(e) => setSearchTerm(e.target.value)}
                            selectedLevel={selectedLevel}
                            onLevelChange={(e) => setSelectedLevel(e.target.value)}
                        />

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredLogs.map((log, index) => (
                                        <LogEntry
                                            key={index}
                                            log={log}
                                            index={index}
                                            isExpanded={expandedLogs[index]}
                                            onToggleExpand={toggleExpand}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogViewer;