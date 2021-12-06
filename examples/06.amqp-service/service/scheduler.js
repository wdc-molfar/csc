 const { Service } = require("@molfar/csc")
 const { AmqpManager, Middlewares, yaml2js, getMetrics } = require("@molfar/amqp-client")
 

 var publisher
 var interval
 var instanceConfig
 

 let service = new Service()

 service
	
	.use("configure", async (config, resolve) => {
		
		console.log("configure")
	 	instanceConfig = config
	 	publisher = await AmqpManager.createPublisher(config.service.produce)
	 	
	 	await publisher.use([
		    Middlewares.Schema.validator(config.service.produce.message),
		    Middlewares.Error.BreakChain,
		    Middlewares.Json.stringify
		])
	 	
		resolve({status: "configured"})
	 
	})

	.use("start",  (data, resolve) => {
		
		interval = setInterval( () => {
			console.log("send task")
			publisher.send({
				timeout: Math.round(Math.random() * 1000) + 200
			})
		}, 1000)

		resolve({status: "started"})	
	})

	.use("stop", async (data, resolve) => {
		console.log("stop scheduler")

		if( interval ) {

			clearInterval(interval)
			interval = null
			await publisher.close()
			setTimeout(() => {
				resolve({status: "stoped"})
			},0)
			
		}

		resolve({status: "stoped"})
	})
	.start()
