
async function start() {
	const Container  = require("./lib//m-container")
	const servicePath = require.resolve("./service")
	const container = new Container()
	container.hold(servicePath)
	const service = container.getService( s => s.path == servicePath )
	const serviceInstance = await container.startInstance(service)
	
	try {
		for(let i=0; i<5; i++){
			res = await serviceInstance.execute("interval",{
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

