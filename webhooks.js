const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const config = require('./config.json');
const exec = require('child_process').exec;

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/deploy', (req, res) => {

    const hmac = crypto.createHmac('sha1', config.secret);
    const digest = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    const checksum = req.get(config.sigHeaderName);

    if (!checksum || !digest || checksum !== digest){
        res.send("Wrong signaure");
    }

    const repoPath =  config.rootPath+req.body.repository.name;

    //const branch = req.body.ref.split('/').pop();
    let command = config.defaultBehavior;

    if (fs.existsSync(repoPath+"/"+config.deployScriptName)) {
        command = 'sh ' + config.deployScriptName;
    }
    command = 'cd ' + repoPath + ' && ' + command;
    exec(command,(error, stdout, stderr)=>{
    });
    res.send('In progress');
});

app.listen(config.port);


