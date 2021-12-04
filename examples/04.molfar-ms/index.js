
async function start() {
	const Container  = require("./lib//m-container")
	
	const servicePath = require.resolve("./service")
	const gitUrl = "https://github.com/wdc-molfar/dummy-service.git"

	const container = new Container()
	
	const deployedServicePath = await container.deployService(gitUrl)
	
	// container.hold(servicePath)
	
	// const service = container.getService( s => s.path == servicePath )
	// const serviceInstance = await container.startInstance(service)
	
	const deployed = container.getService( s => s.path == deployedServicePath )
	console.log(deployed)
	
	const deployedInstance = await container.startInstance(deployed)
	

	try {
		for(let i=0; i<5; i++){
			
			// let res = await serviceInstance.execute("interval",{
			// 	interval: (6-i)*1000, 
			// 	i
			// })
			// console.log(res)
			// console.log((6-i)*1000,"==",res.interval, res.i)
			
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
		container.terminateInstance(service)
	}	
	
}

start()

