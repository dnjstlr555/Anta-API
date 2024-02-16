module.exports = {
    port:443,
    portRedir:80,
    ssl:true, // When false, use http, portRedir is ignored
    sslKey:"./key.pem",
    sslCert:"./cert.pem",
    skin:"./skin",
    startWizard:true,
    fileUploadUseTempFiles:true,
    fileUploadTempDir:"./temp", // If fileUploadUseTempFiles is true, this is the temp directory
    fileUploadLimit:50*1024*1024, // 50MB
};