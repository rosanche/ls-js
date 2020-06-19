#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let option = process.argv[2] === '-l';

function ensureZeros(value) {
    return ((value < 10 ? '0' : '') + value)
}

function getPermissionsStringFor(mode, maskRead, maskWrite, maskExec) {
    return (mode & maskRead ? 'r' : '-') + (mode & maskWrite ? 'w' : '-') + (mode & maskExec ? 'x' : '-');
}

function printFile(dirName, file) {
    dirName += dirName[dirName.length - 1] !== '/' ? '/' : '';

    if (file[0] !== '.') {
        fs.stat(dirName + file, function(err, stats) {
            let fileInfo = '';
            let t = stats.ctime;
            fileInfo += getPermissionsStringFor(stats.mode, 0400, 0200, 0100);
            fileInfo += getPermissionsStringFor(stats.mode, 040, 020, 010);
            fileInfo += getPermissionsStringFor(stats.mode, 04, 02, 01);
            fileInfo += ` ${t.getFullYear()}-${ensureZeros(t.getMonth())}-${ensureZeros(t.getDay())} ${ensureZeros(t.getHours())}:${ensureZeros(t.getMinutes())} `;
            console.log(option ? fileInfo + file : file);
        });
    }
}

function lsDir(dirName) {
    let files = fs.readdirSync(dirName);

    files.forEach(file => 
        printFile(dirName, file)
    );
}

function getFiles(pathname) {
    let filesExist = false;
    let prefix = path.basename(pathname);
    let dirName = path.dirname(pathname);
    let files = fs.readdirSync(dirName);

    files.forEach(file => {
        if (file.startsWith(prefix)) {
            filesExist = true;
            printFile(dirName, file)
        }
    });
    return (filesExist);
}

if (process.argv.length > 2 + option) {
    for (let i = 2 + option; i < process.argv.length; i++) {
        try {
            lsDir(process.argv[i]);
        }
        catch (error) {
            if (!getFiles(process.argv[i]))
                if (error.code === 'ENOENT')
                    console.log(`ls: ${process.argv[i]}: No such file or directory`);
                else
                    console.log(error);
        }
    }
}
else {
    lsDir('./');
}
