const configFile = require('./config.json');
const scriptPath = "./deploy.sh";
const config = configFile;
const repositoriesPath = config.rootPath;
const secret = config.secret;
const sigHeaderName = config.sigHeaderName;

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

    let command ="git pull";
    try {
        if (fs.existsSync(scriptPath)) {
            command = scriptPath;
        }
    } catch(err) {
        console.error(err)
    }

    exec('cd ' + path + '&&' + command,(error, stdout, stderr)=>{
        console.log('stdout: ' + stdout);
        if (error !== null) {
            console.log('stderr: ' + stderr);
            console.log('exec error: ' + error);
        }
        console.log("Done");
        res.json({'stdout': stdout , 'stderr': stderr});
    });
});

app.listen(3333);


