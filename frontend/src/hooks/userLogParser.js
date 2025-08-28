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
                    // Se ainda está coletando, adiciona tudo como mensagem normal
                    if (arrayLinesBuffer.length > 0) {
                        currentLog.message += "\n" + arrayLinesBuffer.join("\n");
                    }
                    currentLog.hasArray = false;
                    currentLog.arrayData = null;
                } else if (isPotentialArrayHeaderLine) {
                    // Se era potencial mas nunca veio o "(", deixa como estava
                    isPotentialArrayHeaderLine = false;
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

            // Pula linhas vazias se não estiver coletando array
            if (!line.length && !isCollectingArrayContent) continue;

            // Detecta nova entrada de log
            const dateMatch = trimmedLine.match(/^(\[.*?\])/);

            if (dateMatch && !isCollectingArrayContent) {
                // Finaliza log anterior
                finalizeCurrentLog();

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

                // Detecta se a linha termina com "Array" - melhorada para o formato específico
                const afterTimestamp = trimmedLine.substring(dateMatch[1].length).trim();

                // Casos que devem ser detectados como array:
                // 1. "[timestamp] Array" - linha só com Array
                // 2. "[timestamp] resultArray" - termina com Array
                // 3. "[timestamp] mensagem Array" - termina com " Array"
                if (afterTimestamp === "Array" ||
                    afterTimestamp.endsWith("Array") ||
                    afterTimestamp.endsWith(" Array")) {
                    isPotentialArrayHeaderLine = true;
                }

                if (trimmedLine.includes('Stack trace:')) {
                    currentLog.hasStack = true;
                }

            } else if (currentLog) {
                // Se temos um log atual, processa a linha

                if (isPotentialArrayHeaderLine && trimmedLine === "(") {
                    // Começou o array
                    currentLog.hasArray = true;
                    isCollectingArrayContent = true;
                    arrayLinesBuffer = [line];
                    isPotentialArrayHeaderLine = false;

                } else if (isCollectingArrayContent) {
                    // Coletando conteúdo do array
                    arrayLinesBuffer.push(line);

                    if (trimmedLine === ")") {
                        // Terminou o array
                        currentLog.arrayData = processArrayContent(arrayLinesBuffer);
                        isCollectingArrayContent = false;
                        arrayLinesBuffer = [];
                    }

                } else if (currentLog.hasStack && (trimmedLine.startsWith('#') || (currentLog.stackTrace.length > 0 && trimmedLine))) {
                    // Coletando stack trace
                    currentLog.stackTrace.push(line);

                } else {
                    // Linha normal, adiciona à mensagem
                    if (isPotentialArrayHeaderLine) {
                        // Era potencial array mas não veio "(", então não é array
                        isPotentialArrayHeaderLine = false;
                    }
                    currentLog.message += "\n" + line;
                }
            }
        }

        // Finaliza o último log
        finalizeCurrentLog();

        // Debug: mostra quantos arrays foram encontrados
        const arraysFound = parsedLogs.filter(log => log.hasArray).length;

        return parsedLogs;
    };

    return { parseLog };
};