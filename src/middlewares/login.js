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

module.exports = (model) => {
    const router = express.Router();
    router.get("/login", (req, res, next) => {
        res.send(`
    <form action="/login" method="post">
        <input type="text" name="username" />
        <input type="password" name="password" />
        <button type="submit">Login</button>
    </form>
    <a href="/signup">Signup</a>
    <script>
        document.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.querySelector('input[name="username"]').value;
            const password = e.target.querySelector('input[name="password"]').value;
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.status === 200) {
                document.cookie = 'token=' + data.token;
                window.location.href = '/';
            } else {
                alert(data.error);
            }
        });
    </script>
        `);
    });
    router.get("/logout", (req, res, next) => {
        res.clearCookie('token');
        res.redirect('/login');
    });
    router.get("/signup", (req, res, next) => {
        res.send(`
    <form action="/signup" method="post">
        <input type="text" name="username" />
        <input type="password" name="password" />
        <button type="submit">Signup</button>
    </form>
    <script>
        document.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.querySelector('input[name="username"]').value;
            const password = e.target.querySelector('input[name="password"]').value;
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.status === 200) {
                document.cookie = 'token=' + data.token;
                window.location.href = '/';
            } else {
                alert(data.error);
            }
        });
    </script>
        `);
    });
    router.post("/signup", async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const privateKey = await fs.promises.readFile(model.settings.sslKey);
            if(model.ExistUser(username)){
                return res.status(409).json({ error: 'User already exists' });
            }
            model.AddUser(username, hashedPassword);
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
            if (!model.ExistUser(username)) {
                return res.status(401).json({ error: 'Authentication failed' });
            }
            const passwordMatch = await bcrypt.compare(password, model.GetUserHash(username));
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Authentication failed' });
            }
            const privateKey = await fs.promises.readFile(model.settings.sslKey);
            const token = jwt.sign({ userId: username }, privateKey, {
                expiresIn: '1h',
                algorithm: 'RS256',
            });
            res.status(200).json({ token });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Login failed' });
        }
    });
    return router;
};