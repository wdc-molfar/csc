const path = require("path")
const fs = require("fs")

const { Container } = require("@molfar/csc")
const { yaml2js } = require("@molfar/amqp-client")


const workerPath = path.resolve(__dirname, "./service/worker.js")
const workerConfig = yaml2js(fs.readFileSync(path.resolve(__dirname, "./msapi/worker.msapi.yaml")).toString())

const delay = interval => new Promise( resolve => {
	setTimeout( () => {
		resolve()
	}, interval )	
}) 


const run = async () => {

	const container = new Container()

	container.hold(workerPath, "--worker 1--")
	container.hold(workerPath, "--worker 2--")
	
	const worker1 = await container.startInstance(container.getService(s => s.name == "--worker 1--"))
	let res = await worker1.execute("configure", workerConfig)
	// console.log(res)
	
	const worker2 = await container.startInstance(container.getService(s => s.name == "--worker 2--"))
	res = await worker2.execute("configure", workerConfig)
	// console.log(res)


	res = await worker1.execute("start")
	// console.log(res)

	res = await worker2.execute("start")
	// console.log(res)

	await delay(3000)

	res = await worker1.execute("stop")
	res = await worker2.execute("stop")
	
	container.terminateAll()
	
}

run()