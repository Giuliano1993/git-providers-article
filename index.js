const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
require('dotenv').config()
const app = express();
const port = 3000;
const axios = require('axios').default;



app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));



// things i could show


// 1 authentication process

//not needed for github and gitlab, only for bitbucket




//2 retrieve repositories

//git

const gitHubBasis = "https://api.github.com";
const gitLabBasis = "https://gitlab.com/api/v4";

app.get('/git/repositories', async (req,res)=>{
  const repoUrl = gitHubBasis + '/user/repos?per_page=10';
  console.log(repoUrl);
  axios.get(repoUrl,{
    method: 'GET',
    headers:{
      'Authorization': 'Bearer '+process.env.GITHUB_TOKEN,
      'X-GitHub-Api-Version':'2022-11-28',
      'Accept': 'application/vnd.github+json'
    }
  }).then((response)=>{
    console.log(response)
    // this is a good way to send github data back within this enviroment. (node and axios). if you go with res.send or json.stringify 
    // you get a circular reference error. https://github.com/axios/axios/issues/836
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
    method: 'GET',
    headers:{
      'Authorization': 'Bearer '+process.env.GITLAB_TOKEN,
      'Accept': 'application/json'
    }
  }).then((response)=>{
    console.log(response)
    // this is a good way to send github data back with axios. if you go with res.send or json.stringify 
    // you get a circular reference error. https://github.com/axios/axios/issues/836
    res.json(response.data);
  }).catch((err)=>{
    console.log(err)
    res.send(err);
  }) 
})




app.listen(port,()=>{
  console.log(`App listening on port ${port}`)
})