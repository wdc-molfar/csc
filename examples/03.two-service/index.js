
async function start() {
	const { Container } = require("../../index")
	const service1Path = require.resolve("./service1")
	const service2Path = require.resolve("./service2")
	
	const container = new Container()
	container.hold(service1Path)
	container.hold(service2Path)
	
	console.log(container.getService())
	
	await container.startAll()
	
	const service1Instance = container.getService( s => s.path == service1Path ).instance
	const service2Instance = container.getService( s => s.path == service2Path ).instance
	
	await Promise.all([
		Promise.all(([0,1,2]).map( async i => {
			res = await service1Instance.execute("interval", {
				interval:(6-i)*1000, 
				i
			})
			console.log("SERVICE 1 >> ", res)
		})),
		Promise.all(([0,1,2]).map( async i => {
			res = await service2Instance.execute("interval", {
				interval:(6-i)*1000, 
				i
			})
			console.log("SERVICE 2 >> ", res)
		}))
	])

	container.terminateAll()
	
}

start()

