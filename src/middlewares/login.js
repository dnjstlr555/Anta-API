/* 
TODO : Login middleware
유저의 존재 이유
함부로 남이 파일 시스템에 접근할수 있기 때문에, 유저의 존재 여부와 그 권한을 확인해야한다.
linux처럼 predefined된 admin user를 생성하고 해당 유저는 들어오자마자 비밀번호 변경을 요구하게 한다.
해당 유저는 전체 파일 시스템에 대한 권한을 가지고 있으며, 다른 유저들의 권한을 관리할 수 있다.
다른 유저는 회원 가입을 하면 일단 일반 유저로 등록되며, admin 유저가 권한을 부여해야만 파일 시스템에 접근할 수 있다.
유저별 권한은 "*", "fake1;", "fake1;fake2;" 이런식으로 부여할 수 있으며, 해당 권한은 해당 유저가 가진 권한을 나타낸다.
이쯤 되면 폴더에 예약어를 설정해야 하겠다. (login, signup, logout, ;포함x)
권한은 JWT에 부여하는걸로 하자.
대신 JWT를 발급할때 user db에서 권한을 확인하고, 해당 권한을 부여하자. 아니면 이중 확인을 해도 나쁘지 않을듯
user db의 구조는 다음과 같다
    id password permission
설정에서 기본 유저의 권한을 설정할 수 있음 (defaultUserPermission="*")
admin 유저의 유저 권한 관리 페이지를 만들어야함 (유저 추가, 삭제, 권한 부여, 권한 삭제)

추가로 로그인 보안을 잘 모르기 때문에 더 나은 방법이 있는지 확인해봐야됨.
스케일이 너무 커져서 잘 관리를 해야할듯
*/

const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = (model, controller) => {
    const router = express.Router();
    router.get("/favicon.ico", (req, res, next) => {
        controller.CommonRequestHandlers.SendResource(req, res, "favicon.ico");
    });
    router.get("/login", (req, res, next) => {
        if(req.cookies.token) return res.redirect('/');
        const queryKeys = Object.keys(req.query);
        if (queryKeys.includes("resource")) {
            controller.CommonRequestHandlers.SendResource(req, res, req.query.resource);
            return;
        }
        controller.CommonRequestHandlers.SendResource(req, res, "login.html");
    });
    router.get("/logout", (req, res, next) => {
        res.clearCookie('token');
        res.redirect('/login');
    });
    router.get("/changepw", async (req, res, next) => {
        try {
            const token = req.cookies.token;
            const publicKey = await fs.promises.readFile(model.settings.jwtRSAPublicKeyPath);
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            //only can change passwor when the user name is given in the token
            if (decoded.userId == null || !model.users.ExistUser(decoded.userId)){
                return res.redirect('/login');
            }
        } catch (error) {
            console.log(error)
            return res.redirect('/login');
        }
        const queryKeys = Object.keys(req.query);
        if (queryKeys.includes("resource")) {
            controller.CommonRequestHandlers.SendResource(req, res, req.query.resource);
            return;
        }
        controller.CommonRequestHandlers.SendResource(req, res, "changepw.html");
    });
    router.post("/changepw", async (req, res, next) => {
        try {
            const { password } = req.body;
            const token = req.cookies.token;
            const publicKey = await fs.promises.readFile(model.settings.jwtRSAPublicKeyPath);
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            const username = decoded.userId;
            if(!model.users.ExistUser(username)){
                return res.status(401).json({ error: 'User does not exist' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            model.users.ChangeHash(username, hashedPassword);
            res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Password change failed' });
        }
    });
    router.post("/signup", async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const privateKey = await fs.promises.readFile(model.settings.jwtRSAPrivateKeyPath);
            if(model.users.ExistUser(username)){
                return res.status(409).json({ error: 'User already exists' });
            }
            model.users.AddUser(username, hashedPassword);
            const token = jwt.sign({ userId: username }, privateKey, {
                expiresIn: '1h',
                algorithm: 'RS256',
            });
            res.status(200).json({ token });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Signup failed' });
        }
    });
    router.post("/login", async (req, res, next) => {
        try {
            const { username, password } = req.body;
            if (!model.users.ExistUser(username)) {
                return res.status(401).json({ error: 'Username/Password does not match.' });
            }
            const hash = model.users.Hash(username);
            const privateKey = await fs.promises.readFile(model.settings.jwtRSAPrivateKeyPath);
            if(hash=="") {
                //if hash is empty, it means the user need to change the password.
                //give the temporary token and redirect to the change password page
                const token = jwt.sign({ userId: username, changePW: true }, privateKey, {
                    expiresIn: '1h',
                    algorithm: 'RS256',
                });
                return res.status(200).json({ token });
            }
            const passwordMatch = await bcrypt.compare(password, hash);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Username/Password does not match.' });
            }
            const token = jwt.sign({ userId: username }, privateKey, {
                expiresIn: '1h',
                algorithm: 'RS256',
            });
            return res.status(200).json({ token });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Login failed for an internal error.' });
        }
    });
    return router;
};