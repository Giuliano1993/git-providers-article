const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
require('dotenv').config()
const app = express();
const port = 3000;
const axios = require('axios').default;
const { exec } = require("child_process");
const fs = require('fs');

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));



// things i could show


// 1 authentication process

//not needed for github and gitlab, only for bitbucket

app.get('/bitbucket/auth', async (req, res) => {
  const url = `https://bitbucket.org/site/oauth2/authorize?client_id=${process.env.BITBUCKET_KEY}&response_type=code`
  res.redirect(url);

});

app.get('/bitbucket/get-token',async (req, res)=>{
  const code = req.query.code;

  //exec("curl -X POST -u $key:$secret https://bitbucket.org/site/oauth2/access_token -d grant_type=authorization_code -d code=$code", $output);
  try {
   
    exec(`curl -X POST -u ${process.env.BITBUCKET_KEY}:${process.env.BITBUCKET_SECRET} https://bitbucket.org/site/oauth2/access_token -d grant_type=authorization_code -d code=${code}`, (error, stdout, stderr) => {
      if(error) throw error;
      if(stdout){
        
        const data = JSON.parse(stdout);

        const bitbucketAccessData = {
          token : data.access_token,
          refresh_token : data.refresh_token,
        }

        let fileData = fs.readFileSync('./tokens.json');
        fileData = JSON.parse(fileData)
        fileData.tokens.bitbucket = bitbucketAccessData;
        fileData = JSON.stringify(fileData);
        fs.writeFileSync('./tokens.json', fileData,  (err)=>{
          console.error(err)
        })
        return res.json(data);
      }
    });
  } catch (error) {
    console.error(error);
    return res.json(error)
  }
  
})


//2 retrieve repositories

//git

const gitHubBasis = "https://api.github.com";
const gitLabBasis = "https://gitlab.com/api/v4";
const bitbucketBasis = "https://api.bitbucket.org/2.0"


app.get('/git/repositories', async (req,res)=>{
  const repoUrl = gitHubBasis + '/user/repos?per_page=10';
  console.log(repoUrl);
  axios.get(repoUrl,{
    headers:{
      'Authorization': 'Bearer '+process.env.GITHUB_TOKEN,
      'X-GitHub-Api-Version':'2022-11-28',
      'Accept': 'application/vnd.github+json'
    }
  }).then((response)=>{
    res.json(response.data);
  }).catch((err)=>{
    console.log(err)
    res.send(err);
  }) 
})

app.get('/gitlab/repositories', async (req,res)=>{
  const repoUrl = gitLabBasis + '/projects?owned=1&per_page=10';
  console.log(repoUrl);
  axios.get(repoUrl,{
    headers:{
      'Authorization': 'Bearer '+process.env.GITLAB_TOKEN,
      'Accept': 'application/json'
    }
  }).then((response)=>{
    res.json(response.data);
  }).catch((err)=>{
    console.log(err)
    res.send(err);
  }) 
})

app.get('/bitbucket/workspaces', async (req,res)=>{
  const wsUrl = bitbucketBasis + '/user/permissions/workspaces';
  let fileData = fs.readFileSync('./tokens.json');
  fileData = JSON.parse(fileData);
  const token = fileData.tokens.bitbucket.token;
  axios.get(wsUrl,{
    headers:{
      'Authorization': 'Bearer '+token,
      'Accept': 'application/json'
    }
  }).then((response) => {
    res.json(response.data)
  }).catch((error) => {
    console.log(error);
    res.send(error)
  })
})

app.get('/bitbucket/repositories', async (req,res)=>{
  const repoUrl = bitbucketBasis + '/repositories/'+req.query.ws;
  let fileData = fs.readFileSync('./tokens.json');
  fileData = JSON.parse(fileData);
  const token = fileData.tokens.bitbucket.token;

  axios.get(repoUrl,{
    headers:{
      'Authorization': 'Bearer '+token,
      'Accept': 'application/json'
    }
  }).then((response) => {
    res.json(response.data)
  }).catch((error) => {
    console.log(error);
    res.send(error)
  })

})




app.listen(port,()=>{
  console.log(`App listening on port ${port}`)
})