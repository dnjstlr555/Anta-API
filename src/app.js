//define external modules
const express = require('express');
const http2Express = require('http2-express-bridge')

//define core modules
const http2 = require('http2')
const http = require('http')
const fs = require('fs');

//define internal modules
const Model=require('./models/model');
const Controller=require('./controllers/controller');
const PathCallPlugin=require('./controllers/pathcallplugin');

//initialize the model and controller
const model=new Model("./configs/shared.cfg", "./configs/general.cfg");
const pathcallplugin=new PathCallPlugin(model);
const controller=new Controller(model, pathcallplugin);

// define middlewares
const logMiddleware = require('./middlewares/log');

// define routers
const innerRouter = require('./routes/innerRoute')(controller);
const staticRouter = require('./routes/staticRoute')(controller);
const defaultRouter = require('./routes/defaultRoute')(controller);

const app = model.settings.ssl == true ? http2Express(express) : express(); //use http2 if ssl is enabled

app.use(logMiddleware);
app.use(innerRouter);
app.use(staticRouter);
app.use(defaultRouter);

if(model.settings.ssl == false) {
    app.listen(model.settings.port, function () {
        console.log(`Listening on port ${model.settings.port}`);
    });
} else {
    const portAlt=model.settings.portRedir;
    const port=model.settings.port;
    const options = {
        key: fs.readFileSync(model.settings.sslKey),
        cert: fs.readFileSync(model.settings.sslCert)
    };
    const server = http2.createSecureServer(options, app);
    server.listen(port, function () {
        console.log(`Listening on port ${port}`);
    });
    http.createServer((req, res) => {
        res.writeHead(301, { Location: `https://${req.headers.host.split(":")[0]}:${port}${req.url}` })
        res.end()
    }).listen(portAlt, () => {
        console.log(`Listening on port ${portAlt} - Redirecting to ${port}`)
    })
}