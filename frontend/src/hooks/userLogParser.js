export const useLogParser = () => {
    const parseLog = (logText) => {
        const logEntries = logText.split("\n");
        const parsedLogs = [];
        let currentLog = null;
        let isCollectingArrayContent = false; // True when we are between ( and )
        let arrayLinesBuffer = []; // Temporary buffer for lines of the current array, including '(' and ')'
        let isPotentialArrayHeaderLine = false; // True if the current log's initial line ended with " Array"

        const processArrayContent = (contentLinesWithParentheses) => {
            // contentLinesWithParentheses includes '(', content, and ')'
            return contentLinesWithParentheses.map(line => line.trimStart()).join("\n");
        };

        const finalizeCurrentLog = () => {
            if (currentLog) {
                if (isCollectingArrayContent) {
                    // Array was started with '(' but ')' was not found
                    currentLog.hasArray = false;
                    currentLog.arrayData = null;
                    // Append buffered lines (which would include the opening '(') to the main message
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
                        // Basic keyword detection for level if not a PHP specific one
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
                };

                // Check if the primary message line itself indicates an array that will be followed by '('
                if (trimmedLine.endsWith(" Array")) { // Example: "[timestamp] Some Message Array"
                    isPotentialArrayHeaderLine = true;
                } else if (trimmedLine.includes('Stack trace:')) {
                    currentLog.hasStack = true;
                }

            } else if (currentLog) {
                if (isPotentialArrayHeaderLine && trimmedLine === "(") {
                    currentLog.hasArray = true;
                    isCollectingArrayContent = true;
                    arrayLinesBuffer = [line]; // Start buffer with the line that is '('
                    isPotentialArrayHeaderLine = false;
                } else if (isCollectingArrayContent) {
                    arrayLinesBuffer.push(line); // Add current line to buffer
                    if (trimmedLine === ")") {
                        currentLog.arrayData = processArrayContent(arrayLinesBuffer);
                        isCollectingArrayContent = false; // Done with this array
                    }
                } else if (currentLog.hasStack && (trimmedLine.startsWith('#') || (currentLog.stackTrace.length > 0 && trimmedLine))) {
                    currentLog.stackTrace.push(line);
                } else {
                    if (isPotentialArrayHeaderLine) {
                        // It was a potential array header, but the next line wasn't '('
                        // So, it's just part of the normal message.
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
