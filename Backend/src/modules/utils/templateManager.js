const fs = require('fs');
const PathHelper = require('./pathHelper');
const logger = require('./logger');

class TemplateManager {
    constructor() {
        // Ensure data folder exists
        const dataDir = PathHelper.resolve('data');
        PathHelper.ensureDir(dataDir);
        
        this.filePath = PathHelper.resolve('data', 'templates.json');
        this.cache = null;
    }

    _load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            logger.error(`TemplateManager Load Error: ${error.message}`);
        }
        return [];
    }

    _save(templates) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(templates, null, 2));
            this.cache = templates;
        } catch (error) {
            logger.error(`TemplateManager Save Error: ${error.message}`);
        }
    }

    getAll() {
        if (!this.cache) {
            this.cache = this._load();
        }
        return this.cache;
    }

    saveTemplate(template) {
        let templates = this.getAll();
        const index = templates.findIndex(t => t.id === template.id);
        
        if (index >= 0) {
            templates[index] = template; // Update
        } else {
            templates.push(template); // Create
        }
        
        this._save(templates);
        return template;
    }

    deleteTemplate(id) {
        let templates = this.getAll();
        const initialLen = templates.length;
        templates = templates.filter(t => t.id !== id);
        
        if (templates.length !== initialLen) {
            this._save(templates);
            return true;
        }
        return false;
    }
}

module.exports = new TemplateManager();
