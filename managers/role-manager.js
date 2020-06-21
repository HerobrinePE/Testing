
const findMemberFrom = (user, guild) => guild.members.cache.get(user.id);

/**
 * Removes all `roles` roles from a given member.
 */
function clearRoles(member,roles) {

    const nameOptions = roles.map(role => role ? role.name : null);

    member.roles.cache.forEach( role  => {

        if (nameOptions.includes(role.name)) {
            member.roles.remove(role);
        }
    }
    );
}

/**
 * Sets `role` to the member and removes all the `options` from the user's roles.
 */
function setMemberRole(member, role, options, strict) {

    if (role === null || strict === true) {
        clearRoles(member, options);
        console.log("Cleared Roles");
    }


    if (role !== null) {
        member.roles.add(role);
        console.log("Added Role");
    }
}


/**
 * Starts role management listening for the given message and client.
 */
function manageRoles(message,client,config) {

    // Object key lookup time is still constant?
    // ...right?


    console.log("Fetching emoji map from 'emojimap'");

    // Firstly, EMOJI_MAP is a Dictionary<String,String>, with the emoji
    // as the keys and the role names as the values.
    const EMOJI_MAP = require(`../json/maps/${config.mapname}.json`);

    console.log("emojimap:",EMOJI_MAP);

    console.log("Populating emoji map with roles");

    let error = false;

    Object.keys(EMOJI_MAP).forEach(emoji => {

        message.react(emoji).catch(error => {
            console.log(`Error on ${config.mapname}`);
            console.log("Couldn't react",error);
            console.log(`Reaction: ${emoji}`);
        });

        const selectedRole = EMOJI_MAP[emoji];

        // Then EMOJI_MAP becomes a Dictionary<String,Role>

        if (selectedRole !== null) {
            EMOJI_MAP[emoji] = message.guild.roles.cache.find( role =>
                role.name === selectedRole 
            );

        }

        // We should probably log this :P
        // and stop the function execution
        if (!selectedRole && selectedRole !== null) {
            console.log(`Could not fetch role for ${emoji} (${selectedRole} role).`,);
            error = true;
        }
    });

    if (error === true) {
        console.log("Terminating");
        return;
    }

    console.log("Freezing map");

    // The values randomly become `undefined` if we don't do this.
    Object.freeze(EMOJI_MAP);

    const reactionFilter = (reaction) => 
        Object.keys(EMOJI_MAP).includes(reaction.emoji.name) ||
        Object.keys(EMOJI_MAP).includes(reaction.emoji.id) 

    const collector = message.createReactionCollector(reactionFilter);

    console.log("Setting onReaction function");

    // The 'OnReaction' function is given below.
    collector.on("collect", (reaction,user) => {

        if (client.user.id === user.id) {
                return;
        }

        const emoji = reaction.emoji.name;

        console.log(`Reaction ${emoji} from ${user.tag}`);

        const member = findMemberFrom(user,message.guild);

        let selectedRole = EMOJI_MAP[emoji];
        
        if (selectedRole === undefined) { 
            selectedRole = EMOJI_MAP[reaction.emoji.id];
        }


        // Sometimes the keys of emoji map just become undefined.
        // so we _have_ to check this thing
        if (selectedRole !== undefined) {

            setMemberRole(member, selectedRole, Object.values(EMOJI_MAP),config.strict);

        }
        else {
            console.log("Undefined Emoji Index");
            console.log(`The emoji ${emoji} is not present in the avaliable options.`);
            console.log("Emojis: ", Object.keys(EMOJI_MAP));
            console.log("EMOJI_MAP[emoji]:", EMOJI_MAP[emoji]);
            console.log("EMOJIs.includes(emoji):", Object.keys(EMOJI_MAP).includes(emoji));
        }

    });

            console.log("Done");
        }

exports.manageRoles = manageRoles;
