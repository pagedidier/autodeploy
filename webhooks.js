const configFile = require('./config.json');
const scriptPath = "deploy.sh";
const config = configFile;
const repositoriesPath = config.rootPath;
const secret = config.secret;
const sigHeaderName = config.sigHeaderName;
let command = config.defaultBehavior;

let crypto = require('crypto');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const exec = require('child_process').exec;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/deploy', (req, res) => {

    const hmac = crypto.createHmac('sha1', secret);
    const digest = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex')
    const checksum = req.get(sigHeaderName);

    if (!checksum || !digest || checksum !== digest){
        res.send("Wrong signaure");
    }

    const repoName = req.body.repository.name;
    const path = repositoriesPath+repoName;
    const branch = req.body.ref.split('/').pop();
    try {
        if (fs.existsSync(repositoriesPath+scriptPath)) {
            command = 'sh ' + scriptPath;
        }
    } catch(err) {
        console.error(err)
    }
    command = 'cd ' + repositoriesPath + ' && ' + command;
    exec(command,(error, stdout, stderr)=>{
        //console.log('stdout: ' + stdout);
        if (error !== null) {
            console.log('stderr: ' + stderr);
            console.log('exec error: ' + error);
        }
        res.json({'stdout': stdout , 'stderr': stderr});
    });
    res.send('Done');
});

console.log("Server started on "+ config.port);
app.listen(config.port);


