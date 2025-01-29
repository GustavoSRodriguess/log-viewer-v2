const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});