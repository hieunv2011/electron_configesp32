const fs = require("fs");
const path = require("path");

const now = new Date();
const version = `${now.getFullYear()}.${now.getMonth()+1}.${now.getDate()}.${now.getHours()}${now.getMinutes()}`;

const versionFile = path.join(__dirname, "version.json");
fs.writeFileSync(versionFile, JSON.stringify({ version }, null, 2));
console.log("Generated build version:", version);
