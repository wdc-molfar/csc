
async function start() {
	const { Container } = require("../../index")
	const servicePath = require.resolve("./child")
	const container = new Container()
	container.hold(servicePath)
	console.log(container.getService())
	
	const service = container.getService( s => s.path == servicePath )
	const serviceInstance = await container.startInstance(service)
	
	try {
		for(let i=0; i<5; i++){
			res = await serviceInstance.interval({
				interval: Math.round(Math.random()*3000+1000)
			})
			// res = await serviceInstance.execute("interval",{
			// 	interval:(6-i)*1000, 
			// 	i
			// })
			console.log(res)
			// console.log((res.interval, res.i)
		}
	} catch (e) {
		console.log(e.toString())
	} finally {
		container.terminateInstance(service)
	}	
	
}

start()

