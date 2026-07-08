const { ActivityType } = require("discord.js");
const mysqlfunc = require("../function/mysql.js");

global.mysqlStatus = false;

global.mysqlConnection;
module.exports = {
    name: 'ready',
    description: 'When CLient Is Ready',
    once : true,
	async execute(client) {
        console.log("Client Ready");
        mysqlConnection = await mysqlfunc.CreatePool();
        await require("../TestFunction/mysql_test").TestConnection();
	}
};
