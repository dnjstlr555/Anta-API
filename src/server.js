//define core modules
const http2 = require('http2')
const http = require('http')

//define internal module
const {app, model} = require('./app')(process.argv[2], process.argv[3])
const port = model.settings.port;
const server = model.settings.ssl == true ? http2.createSecureServer(model.GetHTTP2Config(), app) : http.createServer(app);
server.listen(port, function () {
    console.log(`Listening on port ${port}`);
});

if(model.settings.ssl == true) {
    const portAlt=model.settings.portRedir;
    http.createServer((req, res) => {
        res.writeHead(301, { Location: `https://${req.headers.host.split(":")[0]}:${port}${req.url}` })
        res.end()
    }).listen(portAlt, () => {
        console.log(`Listening on port ${portAlt} - Redirecting to ${port}`)
    })
}