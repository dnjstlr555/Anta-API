/*
    This file contains the file management controller.
    The file management controller is responsible for handling file management requests.
    The file management requests are:
    1. SaveFile: Save the file to the specified folder.
    2. DeleteFile: Delete the file from the specified folder.
    3. RenameFile: Rename the file in the specified folder. (TODO)
    4. MoveFile: Move the file to the specified folder. (TODO)
    5. Zip: Zip the file or folder. (TODO)
    6. Unzip: Unzip the file. (TODO)
*/

const path = require("path");
const fs = require("fs");

module.exports = (context, model) => {
    return {
        SaveFile: SaveFile,
        DeleteFile: DeleteFile,
        RenameFile: RenameFile,
        MoveFile: MoveFile
    };
    async function SaveFile(req, res, folderPath) {
        if (!req.files || Object.keys(req.files).length === 0) {
            return false;
        }
        const file = req.files.file; //name must be "file" in the form.
        const filePath = path.join(folderPath, file.name);
        const errResult = await mv(filePath);
        if (errResult == undefined) {
            res.redirect(req.path);
            return true;
        }
        return false;
        // Helper Function
        function mv(filePath) {
            return new Promise((resolve, reject) => {
                file.mv(filePath, (err) => {
                    if (err) {
                        resolve(err);
                    }
                    resolve();
                });
            });
        }
    }
    async function DeleteFile(req, res, folderPath, fileName) {
        const file = path.join(folderPath, fileName);
        if (await CheckFileExist(file)) {
            const errResult = await DeleteFile(file);
            if (errResult == undefined) {
                res.send("true");
                return true;
            }
        }
        return false;
        function CheckFileExist(filePath) {
            return new Promise((resolve, reject) => {
                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        resolve(false);
                    }
                    resolve(true);
                });
            });
        }
        function DeleteFile(filePath) {
            return new Promise((resolve, reject) => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        resolve(err);
                    }
                    resolve();
                });
            });
        }
    }
    function RenameFile(req, res, folderPath, fileName, newFileName) {
        //TODO
        model.RenameFile(folderPath, fileName, newFileName);
    }
    function MoveFile(req, res, folderPath, fileName, newFolderPath) {
        //TODO
        model.MoveFile(folderPath, fileName, newFolderPath);
    }
}