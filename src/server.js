//define core modules
const http2 = require('http2')
const http = require('http')

//define internal module
const {app, model} = require('./app')(process.argv[2], process.argv[3]);

class ServerWrapper {
    constructor(app, model) {
        this.model = model;
        this.app = app;
        this.server = null;
        this.serverRedir = null;
    }

    listen() {
        const port = this.model.settings.ssl == true ? this.model.settings.portSSL : this.model.settings.port;
        const server = this.model.settings.ssl == true ? http2.createSecureServer(this.model.GetHTTP2Config(), this.app) : http.createServer(this.app);
        server.listen(port, function () {
            console.log(`Listening on port ${port}`);
        });

        let serverRedir;
        if(this.model.settings.ssl == true) {
            const portAlt=this.model.settings.portRedir;
            serverRedir=http.createServer((req, res) => {
                res.writeHead(301, { Location: `https://${req.headers.host.split(":")[0]}:${port}${req.url}` })
                res.end()
            }).listen(portAlt, () => {
                console.log(`Listening on port ${portAlt} - Redirecting to ${port}`)
            })
        }
        this.server = server;
        this.serverRedir = serverRedir;
    }

    close() {
        this.server.close(() => {
            console.log(`Server stopped`);
        });
        if(this.model.settings.ssl == true) {
            this.serverRedir.close(() => {
                console.log(`Redirection Server stopped`);
            });
        }
    }
}

const serverWrapper = new ServerWrapper(app, model);
serverWrapper.listen();

const gui = require('./utils/gui')(model, serverWrapper);
gui.mainWindow();