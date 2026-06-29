async function TestConnection()
{
    await mysqlConnection.getConnection(async function(err, con) {
        if (err) {
            console.log(err);
            mysqlStatus = false;
            return; // not connected!
        }
        const [rows,fields] = await con.promise().query("SELECT CURRENT_TIME();");
        if(rows || fields) {
            console.log("Connection Success");
            mysqlStatus = true;
        }
        con.release(); // Release Connection
    });
    return;
}

module.exports = {
    TestConnection
}