const request = require("supertest");
const fs = require("fs");

const EssentialConfig = require("../src/models/essentialConfig");
const [generalPath, sharedPath] = ["./test/temp/configs/general.cfg", "./test/temp/configs/shared.cfg"];
let app;
beforeAll(() => {
    if (!InitTest()) {
        console.error("Failed to initialize test");
        process.exit(1);
    }
    app = require("../src/app")(sharedPath, generalPath).app;
});
afterAll(() => {
    if (!CleanUpTest(generalPath, sharedPath)) {
        console.error("Failed to clean up test");
    }
});
describe("Test the staticRoute responsible path parts", () => {
    test("request root path, expected 200", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
    test("request unshared folder path, expected 404", async () => {
        const response = await request(app).get("/notshared");
        expect(response.statusCode).toBe(404);
    });
    test("request shared folder path, expected 200", async () => {
        const response1 = await request(app).get("/test1");
        const response2 = await request(app).get("/test2");
        expect(response1.statusCode).toBe(200);
        expect(response2.statusCode).toBe(200);
    });
    test("request invalid file within shared folder path, expected 404", async () => {
        const response = await request(app).get("/test1/invalid.txt");
        expect(response.statusCode).toBe(404);
    });
    test("request valid file paths, expected 200 and file contents", async () => {
        const response1 = await request(app).get("/test1/test.txt");
        const response2 = await request(app).get("/test2/test.txt");
        expect(response1.statusCode).toBe(200);
        expect(response2.statusCode).toBe(200);
        expect(response1.text).toBe("The cake is a lie");
        expect(response2.text).toBe("viva la vida");
    });
    test("post to invalid path, expected 404", async () => {
        const response = await request(app).post("/invalidpath");
        expect(response.statusCode).toBe(404);
    });
    test("post without file, expected 500", async () => {
        const response = await request(app).post("/test1");
        expect(response.statusCode).toBe(500);
    });
    test("post a file to not shareded folder, expected 404", async () => {
        //attach a file to the request
        fs.writeFileSync("./test/test.txt", "dummy yummy");
        const response = await request(app).post("/notshared").attach("file", "./test/test.txt");
        expect(response.statusCode).toBe(404);
        fs.unlinkSync("./test/test.txt");
    });
    test("post a file to shared folder, expected 302", async () => {
        //302 for redirect (intented)
        fs.writeFileSync("./test/test.txt", "dummy yummy");
        const response = await request(app).post("/test1").attach("file", "./test/test.txt");
        expect(response.statusCode).toBe(302);
        //check if the file is uploaded
        const response2 = await request(app).get("/test1/test.txt");
        expect(response2.text).toBe("dummy yummy");
        fs.unlinkSync("./test/test.txt");
    });
});

describe("Test the queryRoute responsible parts", () => {
    test("request valid resource, expected 200 and resource contents", async () => {
        const response1 = await request(app).get("/?resource=anta.html");
        expect(response1.statusCode).toBe(200);
    });
    test("request invalid resource, expected 404", async () => {
        const response = await request(app).get("/?resource=invalid.html");
        expect(response.statusCode).toBe(404);
    });
    test("request root list, expected 200 and root folder contents", async () => {
        const response = await request(app).get("/?list");
        expect(response.statusCode).toBe(200);
    });
    //TODO for file operations
});

function InitTest() {
    const configs = EssentialConfig;
    const shared = {
        "test1": process.cwd() + "/test/temp/TestFolder",
        "test2": process.cwd() + "/test/temp/TestFolder2",
    };
    if (ExportToFile(configs, generalPath) && ExportToFile(shared, sharedPath) && WriteToFile("The cake is a lie", shared["test1"] + "/test.txt") && WriteToFile("viva la vida", shared["test2"] + "/test.txt")) {
        return true;
    }

    return false;
    function ExportToFile(data, path) {
        return WriteToFile(Object.keys(data).map(key => key + "=" + data[key]).join("\n"), path);
    }
    function WriteToFile(data, path) {
        try {
            //check if directory is exists
            if (!fs.existsSync(path.split("/").slice(0, -1).join("/"))) {
                fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
            }
            fs.writeFileSync(path, data);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

function CleanUpTest(generalPath, sharedPath) {
    try {
        fs.unlinkSync(generalPath);
        fs.unlinkSync(sharedPath);
        fs.rmdirSync("./test/temp/configs");
        //remove all test files
        fs.unlinkSync("./test/temp/TestFolder/test.txt");
        fs.unlinkSync("./test/temp/TestFolder2/test.txt");
        fs.rmdirSync("./test/temp/TestFolder");
        fs.rmdirSync("./test/temp/TestFolder2");
        fs.rmdirSync("./test/temp");
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}