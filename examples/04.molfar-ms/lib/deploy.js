const path = require("path")
const { mkdirs } = require("fs-extra")
const fs = require("fs")
const exec = require('util').promisify(require('child_process').exec)

const DEPLOYMENT_DIR = path.resolve("./examples/04.molfar-ms/.deployment")


const deploy = async gitUrl => {
	
	const REPO_DIR = path.resolve(
		path.resolve(DEPLOYMENT_DIR),
		path.basename(gitUrl,".git")		
	)
	
	
	if(!fs.existsSync(DEPLOYMENT_DIR)){
		mkdirs(DEPLOYMENT_DIR)
	}
	
	if(fs.existsSync(REPO_DIR)){
		fs.rmdirSync(REPO_DIR, {recursive: true})
	}


	const { stdout, stderr } = await exec(`cd ${path.resolve(DEPLOYMENT_DIR)} & git clone ${gitUrl} & cd ${REPO_DIR} & npm i`)
	
	const servicePath = path.resolve(REPO_DIR, require(path.resolve(REPO_DIR,"./package.json")).main || "index.js")
	
	return {
		repo: gitUrl,
		servicePath,
		stdout,
		stderr
	}		

}

const run = async () => {
	const deployment = await deploy("https://github.com/wdc-molfar/csc.git")
	console.log(deployment) 
}
	
	
run()	
