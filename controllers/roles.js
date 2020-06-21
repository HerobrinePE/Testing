
function onLoad(client)
{
    this.client = client;
    this.config = require("../json/roles-config.json");
    this.manager = require("../managers/role-manager.js");
    this.handleRoles = handleRoles;

    const server = client.guilds.cache.get(this.config.serverId);
    this.config.messageData.forEach(data => this.handleRoles(server,data));

}

function handleRoles(server,messageData) {
    const channel = server.channels.cache.get(messageData.channelId);

    if (this.onLoad != onLoad)
    {
        console.log("Bad Idea");
        return;
    }

    console.log("Server is",server.name);
    console.log("Channel is",channel.name);
    console.log("Message is",messageData.messageId);

    channel.messages.fetch(messageData.messageId).then( message =>  {

        // Fetch can either return a Promise<Message> or a Primise<Collection<Message>>
        // so we have to check wich one it is =[
        if (!message.content) {
            message = message.filter(m => m.id === messageData.messageId).first();
        }


        console.log(`Killswitch activated for '${messageData.mapname}'`);

        this.manager.manageRoles(message, this.client, messageData);

    }
    );
}

exports.onLoad = onLoad;
