// Plugin configuration, this is used in the administration when plugins are loaded
var pluginConfig = {
    name: 'Announcement Bar',
    version: '2.0',
    author: 'simsnet',
    frontEndPath: 'AnnouncementBar/AnnouncementBarCore.js'
}

// Backend (server) changes can go here...
require('./AnnouncementBar/AnnouncementBar_server.js');

// Don't change anything below here if you are making your own plugin
module.exports = {
    pluginConfig
}
