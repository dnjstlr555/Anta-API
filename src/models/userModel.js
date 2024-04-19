const sqlite = require('better-sqlite3');
const fs = require('fs');

class UserModel {
    #db;
    constructor(path="./data/user.db") {
        if(path == null) throw new Error("Invalid path");
        if(!fs.existsSync(path)) {
            const dir = path.split("/").slice(0, -1).join("/");
            fs.mkdirSync(dir, {recursive: true});
            fs.writeFileSync(path, "");
        }
        this.#db = new sqlite(path);
        this.#db.pragma("journal_mode = WAL");
        const isTableExist=this.#db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='users'").pluck().get();
        if(isTableExist==0) {
            this.#db.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, hash TEXT, auth TEXT)").run();
        }
        const isUserEmpty=this.#db.prepare("SELECT count(*) FROM users").pluck().get();
        if(isUserEmpty==0) {
            this.AddUser("admin", "", "*:rw;");
        }
    }
    get #UserList() {
        return this.#db.prepare("SELECT * FROM users").all();
    }
    ExistUser(username) {
        if(username==null) throw new Error("Invalid username");
        if(!/^[a-zA-Z0-9]+$/.test(username)) throw new Error("Invalid username, contains special characters");
        const isUserExist=this.#UserList.filter(user => user.username==username).length;
        return isUserExist>0;
    }
    AddUser(username, hash, auth="") {
        //Auth -> Read, Write (default is empty)
        //Ex) "*:rw;" -> Read and Write for all
        //    "example1:rw;example2:r;" -> Read and Write for example1, Read for example2
        if(username==null || hash==null) throw new Error("Invalid username or hash");
        //check if username includes only alphanumeric characters
        if(!/^[a-zA-Z0-9]+$/.test(username)) throw new Error("Invalid username, contains special characters");
        if(this.ExistUser(username)) return false;
        const insert=this.#db.prepare("INSERT INTO users (username, hash, auth) VALUES (@username, @hash, @auth)");
        insert.run({username, hash, auth});
        return true;
    }
    RemoveUser(username) {
        if(username==null) throw new Error("Invalid username");
        if(!/^[a-zA-Z0-9]+$/.test(username)) throw new Error("Invalid username, contains special characters");
        if(!this.ExistUser(username)) return false;
        const remove=this.#db.prepare("DELETE FROM users WHERE username=@username");
        remove.run({username});
        return true;
    }
    ChangeHash(username, hash) {
        if(username==null || hash==null) throw new Error("Invalid username or hash");
        if(!/^[a-zA-Z0-9]+$/.test(username)) throw new Error("Invalid username, contains special characters");
        if(!this.ExistUser(username)) return false;
        const change=this.#db.prepare("UPDATE users SET hash=@hash WHERE username=@username");
        change.run({username, hash});
        return true;
    }
    Get(username) {
        if(username==null) throw new Error("Invalid username");
        if(!/^[a-zA-Z0-9]+$/.test(username)) throw new Error("Invalid username, contains special characters");
        if(!this.ExistUser(username)) return null;
        return this.#UserList.filter(user => user.username==username)[0];
    }
    Hash(username) {
        const user=this.Get(username);
        if(user==null) return null;
        return user.hash;
    }
    get length() {
        return this.#db.prepare("SELECT count(*) FROM users").pluck().get();
    }
}

module.exports = UserModel;