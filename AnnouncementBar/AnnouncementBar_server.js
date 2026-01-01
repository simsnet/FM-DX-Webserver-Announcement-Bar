// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// FM-DX Webserver Announcement Bar v2.0
// Configuration and endpoint management backend
//
// Author: simsnet - https://github.com/simsnet
//
// Additional resources from:
// - Noobish (https://github.com/NoobishSVK)
// - AmateurAudioDude (https://github.com/AmateurAudioDude/)
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

'use strict';

const fs = require('fs');
const path = require('path');
const { logInfo, logWarn, logError } = require('../../server/console');


console.log('AnnouncementBar backend loaded');

process.nextTick(() => {
    try {
        const endpointsRouter = require('../../server/endpoints');

        endpointsRouter.get('/announcement-bar/config', (req, res) => {
            res.json(announcementConfig);
        });

        endpointsRouter.post('/announcement-bar/config', (req, res) => {
            const { message, color } = req.body || {};

            if (typeof message === 'string') {
                announcementConfig.message = message;
            }

            if (typeof color === 'string') {
                announcementConfig.color = color;
            }

            saveConfig();
            res.json({ success: true });
        });

        logInfo('AnnouncementBar: Endpoints registered (delayed)');
    } catch (err) {
        logError('AnnouncementBar: Failed to register endpoints', err);
    }
});


const rootDir = path.dirname(require.main.filename);
const configDir = path.join(rootDir, 'plugins_configs');
const configFile = path.join(configDir, 'AnnouncementBar.json');

const defaultConfig = {
    message: '',
    color: ''
};

let announcementConfig = { ...defaultConfig };

function ensureConfigFile() {
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    if (!fs.existsSync(configFile)) {
        fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    }
}

function loadConfig() {
    try {
        const raw = fs.readFileSync(configFile, 'utf8');
        const parsed = JSON.parse(raw);

        announcementConfig = {
            message: typeof parsed.message === 'string' ? parsed.message : '',
            color: typeof parsed.color === 'string' ? parsed.color : ''
        };

        logInfo('AnnouncementBar: Config loaded');
    } catch (err) {
        logError('AnnouncementBar: Failed to load config, resetting', err);
        announcementConfig = { ...defaultConfig };
        saveConfig();
    }
}

function saveConfig() {
    fs.writeFileSync(configFile, JSON.stringify(announcementConfig, null, 2));
}


ensureConfigFile();
loadConfig();
