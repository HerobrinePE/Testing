
function WarnManager() {
    this.registerWarning = registerWarning;
    this.fetchWarnings = fetchWarnings;

    const low = require("lowdb");
    const FileSync = require("lowdb/adapters/FileSync");

    const adapter = new FileSync("json/warns.json");
    this.database = low(adapter);
    this.database.defaults({warns:{}}).write();
}

// public
function registerWarning(warning) {
    console.log(`Warning "${warning.user}" reason is "${warning.reason}."`);

    const rowName = `warns.${warning.user}`;

    if (!this.database.has(rowName).value()) {

        console.log("User had no warnings; Creating new array.");

        this.database.set(rowName,[]).write();
    }


    this.database.get(rowName).push( {

        time: warning.time,

        reason: warning.reason

    }).write();

    console.log("Warnings written");
}

// public
function fetchWarnings(userId) {
    return this.database.get(`warns.${userId}`).value();
}

exports.WarnManager = WarnManager;
