var PORT = 8080;

const express = require('express')
const webserver = express()

webserver.listen(8080, () => {
    console.log(`Server is running on port ${8080}`);
});

webserver.get("/", (req, res) => {
    res.sendFile('/Client/index.html', { root: __dirname });
});

webserver.use(express.static(__dirname + "/Client/"));

