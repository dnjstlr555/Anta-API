module.exports = (sharedConfigPath="./configs/shared.cfg", generalConfigPath="./configs/general.cfg") => {
    //define external modules
    const express = require('express');
    const http2Express = require('http2-express-bridge');
    const fileUpload = require('express-fileupload');
    const cookieParser = require('cookie-parser');

    //define internal modules
    const Model=require('./models/model');
    const Controller=require('./controllers/controller');

    //initialize the model and controller
    const model=new Model(sharedConfigPath, generalConfigPath);
    const controller=new Controller(model);

    // define middlewares
    const logMiddleware = require('./middlewares/log');
    const loginMiddleware = require('./middlewares/login')(model, controller);
    const authMiddleware = require('./middlewares/auth')(model);

    // define routers
    const queryRouter = require('./routes/queryRoute')(controller);
    const staticRouter = require('./routes/staticRoute')(controller);
    const defaultRouter = require('./routes/defaultRoute')(controller);

    const app = model.settings.ssl == true ? http2Express(express) : express(); //use http2 if ssl is enabled

    app.use(express.urlencoded({ extended: true })); //use urlencoded middleware for post data
    app.use(cookieParser()); //use cookie parser middleware
    app.use(express.json()); //use json middleware for post data

    app.use(logMiddleware);
    app.use(loginMiddleware);
    app.use(authMiddleware);
    app.use(fileUpload(model.GetFileUploadConfigs())); //use file upload middleware
    app.use(queryRouter);
    app.use(staticRouter);
    app.use(defaultRouter);

    return {app, model};
}