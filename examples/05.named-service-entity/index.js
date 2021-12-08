
async function start() {
	const { Container } = require("../../index")
	const servicePath = require.resolve("./child")
	const container = new Container()
	
	container
		.hold(servicePath, "SERVICE1")
		.hold(servicePath, "SERVICE2")
	
	console.log(container.getService())
	
	const service1 = container.getService( s => s.name == "SERVICE1" )
	const serviceInstance1 = await container.startInstance(service1)
	
	const service2 = container.getService( s => s.name == "SERVICE2" )
	const serviceInstance2 = await container.startInstance(service2)
	
	const instances = [serviceInstance1, serviceInstance2]
	let instanceIndex = 0
	try {
		for(let i=0; i<5; i++){
			res = await instances[instanceIndex].interval({
				interval:Math.round(Math.random()*2000+200), 
				i
			})
			console.log(res)
			if(i<2){
				instanceIndex = (instanceIndex) ? 0 : 1	
			} else {
				instanceIndex = 0
				container.terminateInstance(service2)		
			}
			
		}
	} catch (e) {
		console.log(e.toString())
	} finally {
		container.terminateInstance(service1)
	}	
	
}

start()

