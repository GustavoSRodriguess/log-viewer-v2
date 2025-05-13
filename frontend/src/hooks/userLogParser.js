export const useLogParser = () => {
    const parseLog = (logText) => {
        const logEntries = logText.split("\n");
        const parsedLogs = [];
        let currentLog = null;
        let isCollectingArrayContent = false;
        let arrayLinesBuffer = [];
        let isPotentialArrayHeaderLine = false;

        const processArrayContent = (contentLinesWithParentheses) => {
            return contentLinesWithParentheses.map(line => line.trimStart()).join("\n");
        };

        const finalizeCurrentLog = () => {
            if (currentLog) {
                if (isCollectingArrayContent) {
                    currentLog.hasArray = false;
                    currentLog.arrayData = null;
                    if (arrayLinesBuffer.length > 0) {
                        currentLog.message += "\n" + arrayLinesBuffer.join("\n");
                    }
                } else if (isPotentialArrayHeaderLine && !currentLog.hasArray) {
                    // Header looked like an array, but '(' never came.
                }
                parsedLogs.push(currentLog);
            }
            isPotentialArrayHeaderLine = false;
            isCollectingArrayContent = false;
            arrayLinesBuffer = [];
        };

        for (let i = 0; i < logEntries.length; i++) {
            const line = logEntries[i];
            const trimmedLine = line.trim();

            if (!line.length && !isCollectingArrayContent) continue;

            const dateMatch = trimmedLine.match(/^(\[.*?\])/);

            if (dateMatch && !isCollectingArrayContent) {
                finalizeCurrentLog();
                // Use a stable key based on timestamp, initial log line content, AND index
                // This ensures the key remains unique even for identical logs at the same timestamp
                const firstLineOfMessage = line;
                const stableKeyValue = `${dateMatch[1]}---${firstLineOfMessage}---${i}`;

                currentLog = {
                    timestamp: dateMatch[1],
                    level: (() => {
                        const phpLevelMatch = trimmedLine.match(/PHP (Notice|Warning|Error|Fatal error):/);
                        if (phpLevelMatch) {
                            return {
                                'Notice': 'Notice', 'Warning': 'Warning',
                                'Error': 'Error', 'Fatal error': 'Error'
                            }[phpLevelMatch[1]];
                        }
                        if (trimmedLine.toLowerCase().includes("error")) return "Error";
                        if (trimmedLine.toLowerCase().includes("warning")) return "Warning";
                        if (trimmedLine.toLowerCase().includes("notice")) return "Notice";
                        return 'Info';
                    })(),
                    message: line,
                    hasArray: false,
                    arrayData: null,
                    hasStack: false,
                    stackTrace: [],
                    stableKey: stableKeyValue
                };

                if (trimmedLine.endsWith(" Array")) {
                    isPotentialArrayHeaderLine = true;
                } else if (trimmedLine.includes('Stack trace:')) {
                    currentLog.hasStack = true;
                }

            } else if (currentLog) {
                if (isPotentialArrayHeaderLine && trimmedLine === "(") {
                    currentLog.hasArray = true;
                    isCollectingArrayContent = true;
                    arrayLinesBuffer = [line];
                    isPotentialArrayHeaderLine = false;
                } else if (isCollectingArrayContent) {
                    arrayLinesBuffer.push(line);
                    if (trimmedLine === ")") {
                        currentLog.arrayData = processArrayContent(arrayLinesBuffer);
                        isCollectingArrayContent = false;
                    }
                } else if (currentLog.hasStack && (trimmedLine.startsWith('#') || (currentLog.stackTrace.length > 0 && trimmedLine))) {
                    currentLog.stackTrace.push(line);
                } else {
                    if (isPotentialArrayHeaderLine) {
                        isPotentialArrayHeaderLine = false;
                    }
                    currentLog.message += "\n" + line;
                }
            }
        }

        finalizeCurrentLog();
        return parsedLogs;
    };

    return { parseLog };
};
