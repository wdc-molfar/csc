
async function start() {
	const { Container } = require("../../index")
	const servicePath = require.resolve("./child")
	const container = new Container()
	container.hold(servicePath)
	console.log(container.getService())
	
	// container.hold(servicePath)
	// console.log(container.getService())
	
	await container.startAll()
	
	const serviceInstance = container.getService( s => s.path == servicePath ).instance
	
	for(let i=0; i<5; i++){
		res = await serviceInstance.execute("interval",{
			interval:(6-i)*1000, i
		})
		console.log(res)
		console.log((6-i)*1000,"==",res.interval, res.i)
	}

	container.terminateAll()
	
}

start()

