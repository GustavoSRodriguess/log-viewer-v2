const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { error } = require('console');

const app = express();
app.use(cors());

const LOG_DIR = '/root/code/SoftExpertExcellenceSuiteV3/System/log';

async function getAllFiles(dir) {
    const files = await fs.readdir(dir);
    const fileGroups = {
        baseclass: [],
        zarabatana: [],
        tomcat: [],
        platform: [],
        others: []
    };

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            const subFiles = await getAllFiles(filePath);
            for (const group in subFiles) {
                if (fileGroups[group]) {
                    fileGroups[group].push(...subFiles[group]);
                } else {
                    fileGroups.others.push(...subFiles[group]);
                }
            }
        } else if (file.endsWith('.log')) {
            const relativePath = path.relative(LOG_DIR, filePath);

            if (relativePath.toLowerCase().includes('baseclass')) {
                fileGroups.baseclass.push(relativePath);
            } else if (relativePath.toLowerCase().includes('zarabatana')) {
                fileGroups.zarabatana.push(relativePath);
            } else if (relativePath.toLowerCase().includes('tomcat')) {
                fileGroups.tomcat.push(relativePath);
            } else if (relativePath.toLowerCase().includes('platform')) {
                fileGroups.platform.push(relativePath);
            } else {
                fileGroups.others.push(relativePath);
            }
        }
    }

    return fileGroups;
}

async function isTodayLog(filePath) {
    try {
        const fileName = path.basename(filePath);
        const dateMatch = fileName.match(/(\d{4})\.(\d{2})\.(\d{2})/);

        if (dateMatch) {
            const [_, year, month, day] = dateMatch;
            const today = new Date();

            return year === today.getFullYear().toString() &&
                month === (today.getMonth() + 1).toString().padStart(2, '0') &&
                day === today.getDate().toString().padStart(2, '0');
        }

        const content = await fs.readFile(filePath, 'utf8');
        const firstLines = content.split('\n').slice(0, 10).join('\n');
        const contentDateMatch = firstLines.match(/\[(\d{2})-(\d{2})-(\d{4})/);

        if (contentDateMatch) {
            const [_, day, month, year] = contentDateMatch;
            const today = new Date();

            return year === today.getFullYear().toString() &&
                month === (today.getMonth() + 1).toString().padStart(2, '0') &&
                day === today.getDate().toString().padStart(2, '0');
        }

        return false;
    } catch (e) {
        console.error(`Error checking the file date ${filePath}: ${e}`);
        return false;
    }
}

async function deleteOldLogs(dir) {
    const deletedFiles = [];
    const error = [];

    const processDirectory = async (currentDir) => {
        const files = await fs.readdir(currentDir);
        
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                await processDirectory(filePath)
            } else if (file.endsWith('.log')) {
                try {
                    const isToday = await isTodayLog(filePath);
    
                    if (!isToday) {
                        await fs.unlink(filePath);
                        deletedFiles.push(path.relative(LOG_DIR, filePath));
                    }
                } catch (e) {
                    error.push({
                        file: path.relative(LOG_DIR, filePath),
                        error: e.message
                    })
                }
            }
        }
    };
    await processDirectory();
    return { deletedFiles, error };
}

app.get('/api/logs', async (req, res) => {
    try {
        const logGroups = await getAllFiles(LOG_DIR);
        res.json(logGroups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/logs/:filename(*)', async (req, res) => {
    try {
        const filePath = path.join(LOG_DIR, req.params.filename);
        const content = await fs.readFile(filePath, 'utf8');
        res.send(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/logs/:filename(*)', async (req, res) => {
    try {
        const filePath = path.join(LOG_DIR, req.params.filename);
        await fs.unlink(filePath);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/logs', async (req, res) => {
    try {
        const deleteFiles = async (dir) => {
            const files = await fs.readdir(dir);

            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = await fs.stat(filePath);

                if (stat.isDirectory()) {
                    await deleteFiles(filePath);
                } else if (file.endsWith('.log')) {
                    await fs.unlink(filePath);
                }
            }
        };

        await deleteFiles(LOG_DIR);
        res.json({ message: 'All log files deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/logs/old', async (req, res) => {
    try {
        const result = await deleteOldLogs(LOG_DIR);

        if (result.error.length > 0) {
            res.status(207).json({
                message: 'Some files could not be deleted',
                deleteFiles: result.deletedFiles,
                error: result.error
            });
        } else {
            res.json({
                message: 'All files deleted with success',
                deleteFiles: result.deletedFiles
            });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});