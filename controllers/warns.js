
const DEBUG = false;
const TESTER_IDS = ["321040440583520256","415124030408884245"];
const manager_module = require("../managers/warn-manager.js");
const USAGE_WARN = `Usage: \`!warn\` @user reason`;
const USAGE_WARNS = `Usage: \`!warns\` @user`;

const ADMIN_ROLES = ["Staff","Executive"]

function parseWarningsRequest(message) {

    const split = message.content.split(/ +/);

    if (split.length < 2) {
        let error = new Error("Missing required argument");
        error.custom = true;
        throw error;
    }

    const userId = getUserIdFromMention(split[1]);

    if (userId === null) {
        let error = new Error("The second paramter must be a user mention.");
        error.custom = true;
        throw error;
    }

    return userId;
}

function parseWarning(message) {

    const split = message.content.split(/ +/);

    if (split.length < 2) {
        let error = new Error("Missing required arguments");
        error.custom = true;
        throw error;
    }

    const userId = getUserIdFromMention(split[1]);

    if (userId === null) {
        let error = new Error("The second parameter must be a user mention.");
        error.custom = true;
        throw error;
    }

    const warnReason = split[2] ? split.splice(2).join(" ") : null;


    if (!message.mentions.users.has(userId)) {
        let error = new Error("The given user is not valid");
        error.custom = true;
        throw error;
    }

    return {
        user   : userId,
        reason : warnReason,
        time   : message.createdAt.getTime()
    };
}

function getUserIdFromMention(mention) {
    if (!mention) return null;

    if (mention.startsWith('<@') && mention.endsWith('>')) {

        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {

            id = mention.slice(1);

            return id;
        }

    }

    return null;
}

function onMessage(message, client) {

    // safe check
    if (message.author === client.user) return;
    if (message.author.bot === true) return;

    if (DEBUG) {
        if (!TESTER_IDS.includes(message.author.id)) return;
    }
    else if (!(message.member.roles.cache.some(role => ADMIN_ROLES.includes(role.name))))
        return;

    const trim = message.content.trim();

    const getResult = (callback, usageText) => {

        try {
            return callback(message);
        }
        catch (error) {
            console.log("Error when parsing message.");
            console.log(error.message);
            if (error.custom) {
                message.reply(`Your requests was invalid: ${error.message} \n ${usageText}`);
            }
        }
    }

    if (trim.startsWith("!warns")) {

        let userId;
        if (!(userId = getResult(parseWarningsRequest, USAGE_WARNS))) return;

        console.log(`Checking warnings of ${userId}`);

        const warnings = this.manager.fetchWarnings(userId);

        const user = message.mentions.users.get(userId);

        let text;
        if (warnings) {
            text = `Warnings for ${user.username}:`;

            warnings.forEach(warning => {

                warning.reason = warning.reason ?? "None";
                const date = new Date(warning.time);
                text += `\n\`UTC Time\`: ${date.toUTCString()}\n\`Reason\`: ${warning.reason}`;
                text += "\n--";

            });
        }
        else {
            text = "The given user has no warnings";
        }

        message.reply(text);
    }
    else if (trim.startsWith("!warn")) {

        console.log("New warning request detected");
        let warning;
        if (!(warning = getResult(parseWarning, USAGE_WARN))) return;

        this.manager.registerWarning(warning);
        message.reply("Warning registered.");
    }


}

function onLoad(client) {

    this.manager = new manager_module.WarnManager();
    this.onMessage = onMessage;

    client.on("message", (message) => {this.onMessage(message,client)});
}


exports.onLoad = onLoad;
