import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import { FolderView } from './FolderView';
import { LogEntry } from './LogEntry';
import { useLogParser } from '../hooks/userLogParser';
import { API_URL } from '../config';
import { ThemeToggle } from './ThemeToggle';
import { NotificationAlert } from './NotificationAlert';
import { BananaIcon } from 'lucide-react';

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [logFiles, setLogFiles] = useState({
        baseclass: [],
        zarabatana: [],
        tomcat: [],
        platform: [],
        machete: [],
        others: [],
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [loading, setLoading] = useState(false);
    const [expandedLogs, setExpandedLogs] = useState({});
    const [expandedFolders, setExpandedFolders] = useState({});

    const { parseLog } = useLogParser();

    const logContainerRef = React.useRef(null);

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

            const response = await fetch(`${API_URL}/api/logs/${filename}`);
            const content = await response.text();
            const parsedLogs = parseLog(content);

            setLogs(parsedLogs);
            setSelectedFile(filename);
            setExpandedLogs((prev) => {
                const newExpanded = {};
                parsedLogs.forEach((log) => {
                    const key = `${log.timestamp || ''}_${log.message}`;
                    if (prev[key]) {
                        newExpanded[key] = true; // ← use a mesma chave aqui
                    }
                });
                return newExpanded;
            });

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
                    method: 'DELETE',
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
                    method: 'DELETE',
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
                    method: 'DELETE',
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
        setExpandedFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName],
        }));
    };

    const toggleExpand = (log) => {
        const key = `${log.timestamp || ''}_${log.message}`;
        setExpandedLogs((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchLogFiles();
        }, 5000); // 5 segundos

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedFile) return;

        const interval = setInterval(() => {
            fetchLogContent(selectedFile);
        }, 5000); // 5 segundos

        return () => clearInterval(interval);
    }, [selectedFile]);


    useEffect(() => {
        let filtered = logs;

        if (searchTerm) {
            filtered = filtered.filter(
                (log) =>
                    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (log.hasStack &&
                        log.stackTrace.some((line) => line.toLowerCase().includes(searchTerm.toLowerCase())))
            );
        }

        if (selectedLevel !== 'all') {
            filtered = filtered.filter((log) => log.level === selectedLevel);
        }

        setFilteredLogs(filtered);
    }, [logs, searchTerm, selectedLevel]);

    return (
        <div className="h-screen bg-gray-100 dark:bg-gray-900 flex overflow-hidden transition-colors duration-200">
            {/* sidebar */}
            <div className="w-80 bg-white dark:bg-gray-800 shadow-lg flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {/*talvez eu devesse ter criado um cor no tailwind*/}
                        <span className='text-banana'>Banana</span> Log
                    </h2>
                    <BananaIcon className='text-banana' />
                    <NotificationAlert
                        selectedFile={selectedFile}
                        parseLog={parseLog}
                        setLogs={setLogs}
                    />
                    <ThemeToggle />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 dark:text-gray-100">
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

            {/* main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white dark:bg-gray-800 shadow-sm p-4">
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
                            onScrollToTop={() => {
                                setTimeout(() => {
                                    if (logContainerRef.current) {
                                        logContainerRef.current.scrollTop = 0;
                                    }
                                }, 100);
                            }}
                            onScrollToBotton={() => {
                                setTimeout(() => {
                                    if (logContainerRef.current) {
                                        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
                                    }
                                }, 100);
                            }}
                        />

                        <div className="flex-1 overflow-y-auto scroll-smooth" ref={(el) => (logContainerRef.current = el)}>
                            {/* por hora vou deixar sem, tava atrapalhando quando atualziada sozinho :( {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-yellow-500"></div>
                                </div>
                            ) : ( */}
                                <div className="space-y-4">
                                    {[...filteredLogs].reverse().map((log, index) => (
                                        <LogEntry
                                            key={`${log.timestamp || ''}_${log.message}`}
                                            log={log}
                                            index={index}
                                            isExpanded={expandedLogs[`${log.timestamp || ''}_${log.message}`]}
                                            onToggleExpand={() => toggleExpand(log)}
                                        />
                                    ))}
                                </div>
                            {/* )} */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogViewer;