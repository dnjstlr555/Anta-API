//define external modules
const express = require('express');
const http2Express = require('http2-express-bridge');
const fileUpload = require('express-fileupload');

//define internal modules
const Model=require('./models/model');
const Controller=require('./controllers/controller');

//initialize the model and controller
const model=new Model("./configs/shared.cfg", "./configs/general.cfg");
const controller=new Controller(model);

// define middlewares
const logMiddleware = require('./middlewares/log');
const loginMiddleware = require('./middlewares/login');

// define routers
const queryRouter = require('./routes/queryRoute')(controller);
const staticRouter = require('./routes/staticRoute')(controller);
const defaultRouter = require('./routes/defaultRoute')(controller);

const app = model.settings.ssl == true ? http2Express(express) : express(); //use http2 if ssl is enabled

app.use(logMiddleware);
//app.use(loginMiddleware);
app.use(fileUpload(model.GetFileUploadConfigs())); //use file upload middleware
app.use(queryRouter);
app.use(staticRouter);
app.use(defaultRouter);

module.exports = {app, model};