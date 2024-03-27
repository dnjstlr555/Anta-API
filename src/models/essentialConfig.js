module.exports = {
    port:80,
    portSSL:443, // when using http2, this is the port for http
    portRedir:80,
    ssl:false, // When false, use http, portRedir is ignored
    sslKey:"./cert/key.pem",
    sslCert:"./cert/cert.pem",
    jwtRSAPublicKeyPath:"./cert/jwtRS256.key.pub",
    jwtRSAPrivateKeyPath:"./cert/jwtRS256.key",
    skin:"./skin",
    startWizard:true,
    fileUploadUseTempFiles:true,
    fileUploadTempDir:"./temp", // If fileUploadUseTempFiles is true, this is the temp directory
    fileUploadLimit:50*1024*1024, // 50MB
};