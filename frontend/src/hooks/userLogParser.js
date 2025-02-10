export const useLogParser = () => {
    const parseLog = (logText) => {
        const logEntries = logText.split('\n');
        const parsedLogs = [];
        let currentLog = null;
        let isCollectingArray = false;
        let arrayContent = [];

        const processArrayContent = (content) => {
            return content.map(line => {
                line = line.trim();
                if (line.includes('=>')) {
                    const [key, value] = line.split('=>').map(part => part.trim());
                    return `    ${key} => ${value}`;
                }
                return line;
            }).join('\n');
        };

        for (let i = 0; i < logEntries.length; i++) {
            const line = logEntries[i].trim();
            if (!line) continue;

            const dateMatch = line.match(/\[(.*?)\]/);
            const levelMatch = line.match(/PHP (Notice|Warning|Error|Fatal error):/);

            if (dateMatch && !isCollectingArray) {
                if (currentLog) {
                    if (currentLog.hasArray) {
                        currentLog.message += '\n' + processArrayContent(arrayContent);
                    }
                    parsedLogs.push(currentLog);
                    arrayContent = [];
                }

                currentLog = {
                    timestamp: dateMatch[1],
                    level: levelMatch ? {
                        'Notice': 'Notice',
                        'Warning': 'Warning',
                        'Error': 'Error',
                        'Fatal error': 'Error'
                    }[levelMatch[1]] : 'Info',
                    message: line,
                    hasStack: false,
                    hasArray: false,
                    stackTrace: [],
                };

                if (line.includes('Array')) {
                    isCollectingArray = true;
                    currentLog.hasArray = true;
                    arrayContent = [line];
                }
            } else if (currentLog) {
                if (line.includes('Stack trace:')) {
                    currentLog.hasStack = true;
                    currentLog.stackTrace.push(line);
                } else if (line.startsWith('#') || line.includes('thrown in')) {
                    currentLog.stackTrace.push(line);
                } else if (isCollectingArray) {
                    arrayContent.push(line);
                    if (line === ')') {
                        isCollectingArray = false;
                        currentLog.message += '\n' + processArrayContent(arrayContent);
                    }
                } else {
                    currentLog.message += '\n' + line;
                }
            }
        }

        if (currentLog) {
            if (currentLog.hasArray) {
                currentLog.message += '\n' + processArrayContent(arrayContent);
            }
            parsedLogs.push(currentLog);
        }

        return parsedLogs;
    };

    return { parseLog };
};