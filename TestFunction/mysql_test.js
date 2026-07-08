async function TestConnection()
{
    await mysqlConnection.getConnection(async function(err, con) {
        if (err) {
            console.log(err);
            mysqlStatus = false;
            return;
        }
        const [rows,fields] = await con.promise().query("SELECT CURRENT_TIME();");
        if(rows || fields) {
            console.log("Connection Success");
            mysqlStatus = true;
        }
        con.release();
    });
    return;
}

module.exports = {
    TestConnection
}