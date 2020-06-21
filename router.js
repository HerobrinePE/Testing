
function onLoad(client) {

    console.log("Router Loaded");
    console.log("Reading Controllers.");

    let fs = require("fs");

    fs.readdir("controllers", function (err, files) {

        console.log("Listing Finished, Loading Controllers.");

        files.filter(file => !file.startsWith(".")).forEach(file => {

            console.log(`Loading ${file}.`);
            new require(`./controllers/${file}`).onLoad(client);
        });

        console.log("Router Finsihed");
    });
}

exports.onLoad = onLoad;
