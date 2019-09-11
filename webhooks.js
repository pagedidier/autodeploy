const configFile = require('./config.json');
const config = configFile;
const repositoriesPath = config.rootPath;
const secret = config.secret;
const sigHeaderName = config.sigHeaderName;

let crypto = require('crypto');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const exec = require('child_process').exec;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const hmac = crypto.createHmac('sha1', secret)


app.post('/deploy', (req, res) => {
  const digest = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex')
  const checksum = req.get(sigHeaderName);

  if (!checksum || !digest || checksum !== digest){
	res.send("Wrong signaure");
  }

  const repoName = req.body.repository.name;
  const path = repositoriesPath+repoName;
  const branch = req.body.ref.split('/').pop();

  exec('cd ' + path + ' && git pull',(error, stdout, stderr)=>{
      console.log('stdout: ' + stdout);
      if (error !== null) {
          console.log('stderr: ' + stderr);
          console.log('exec error: ' + error);
      }
      console.log("Done");	
   });


   res.send('Done');

});

app.listen(3333);


