export const getFolderFromPath = (path) => {
    const parts = path.split('/');
    return parts[0] || 'Outros';
};

export const groupFilesByFolder = (files = []) => {
    if (!Array.isArray(files)) {
        console.error('Files is not an array:', files);
        return {};
    }

    const groups = {};
    files.forEach(file => {
        const folder = getFolderFromPath(file);
        if (!groups[folder]) {
            groups[folder] = [];
        }
        groups[folder].push(file);
    });
    return groups;
};