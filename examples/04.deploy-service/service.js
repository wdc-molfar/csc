
	const {Service} = require("../../index")
	const { extend } = require("lodash")

	const service = new Service()

	service
		.use("_init", (options, resolve) => {
			
			resolve({status:"initiated"})
					
		})
		.use("interval", (message, resolve) => {
			setTimeout(()=>{
				resolve(extend({}, message, {response:{status:"processed"}}))
			}, message.interval)

		})
		
		.start()
