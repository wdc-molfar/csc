
async function start() {
	const {Container}  = require("../../index")
	const path = require("path")
	const servicePath = require.resolve("./service")

	const DEPLOYMENT_DIR = path.resolve("./.deployment")
	const gitUrl = "https://github.com/wdc-molfar/dummy-service.git"

	const container = new Container()
	

	const deployedServicePath = await container.deploy(gitUrl, DEPLOYMENT_DIR)
	const deployed = container.getService( s => s.path == deployedServicePath )
	const deployedInstance = await container.startInstance(deployed)

	container.hold(servicePath)
	const service = container.getService( s => s.path == servicePath )
	const serviceInstance = await container.startInstance(service)
	
	await deployedInstance.execute("_init", {})
	await serviceInstance.execute("_init", {})


	try {
		for(let i=0; i<5; i++){
			
			let res = await serviceInstance.execute("interval",{
				interval: (6-i)*1000, 
				i
			})
			console.log(res)
			console.log((6-i)*1000,"==",res.interval, res.i)
			
			res = await deployedInstance.execute("interval",{
				interval: (6-i)*1000, 
				i
			})
			console.log(res)
			console.log((6-i)*1000,"==",res.interval, res.i)


		}
	} catch (e) {
		console.log(e.toString())
	} finally {
		container.terminateAll()
	}	
	
}

start()

