 const { Service } = require("../lib/service-wrapper")
 const { AmqpManager, Middlewares, yaml2js, getMetrics } = require("@molfar/amqp-client")
 

 let service = new Service({
 	
 	publisher: null,
 	interval: null,
 	config: null,
 	
 	async onConfigure(config,resolve){
 		
 		console.log("configure")
 		this.config = config
	 	this.publisher = await AmqpManager.createPublisher(this.config.service.produce)
	 	
	 	await this.publisher.use([
		    Middlewares.Schema.validator(this.config.service.produce.message),
		    Middlewares.Error.BreakChain,
		    Middlewares.Json.stringify
		])
	 	
		resolve({status: "configured"})
	
 	},

	onStart(data,resolve){
 		
 		console.log("start", this)
 		this.interval = setInterval( () => {
			console.log("send task")
			this.publisher.send({
				timeout: Math.round(Math.random() * 1000) + 200
			})
		}, 1000)

		resolve({status: "started"})	
 	},

 	async onStop(data,resolve){
		
		console.log("stop")
		if( this.interval ) {

			clearInterval(this.interval)
			this.interval = null
			await this.publisher.close()
			setTimeout(() => {
				resolve({status: "stoped"})
			},0)
			
		}

		resolve({status: "stoped"})

	}

 })

 service.start()

