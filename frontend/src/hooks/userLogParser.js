export const useLogParser = () => {
    const parseLog = (logText) => {
        const logEntries = logText.split('\n');
        const parsedLogs = [];
        let currentLog = null;

        for (let i = 0; i < logEntries.length; i++) {
            const line = logEntries[i];
            if (!line.trim()) continue;

            const dateMatch = line.match(/\[(.*?)\]/);
            const levelMatch = line.match(/PHP (Notice|Warning|Error):/);

            if (dateMatch) {
                if (currentLog) {
                    parsedLogs.push(currentLog);
                }
                currentLog = {
                    timestamp: dateMatch[1],
                    level: levelMatch ? levelMatch[1] : 'Info',
                    message: line,
                    stackTrace: []
                };
            } else if (currentLog && line.includes('Stack trace:')) {
                currentLog.hasStack = true;
                currentLog.stackTrace.push(line);
            } else if (currentLog && (line.trim().startsWith('#') || line.includes('thrown in'))) {
                currentLog.stackTrace.push(line);
            } else if (currentLog) {
                currentLog.message += '\n' + line;
            }
        }

        if (currentLog) {
            parsedLogs.push(currentLog);
        }

        return parsedLogs;
    };

    return { parseLog };
};