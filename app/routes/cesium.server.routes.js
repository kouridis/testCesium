module.exports = function(app) {
    var cesium = require('../controllers/cesium.server.controller.js');
    app.get('/cesium', cesium.render);
};