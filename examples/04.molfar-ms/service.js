
	const Service = require("./lib/m-service")
	const { extend } = require("lodash")

	const service = new Service()

	service
		.onInit( (options, resolve) => {
			
			resolve( extend(
				{}, 
				options, 
				{
					response:
						{
							status:"initiated"
						}
					}
			))
		
		})

		.use("interval", (message, resolve) => {
			setTimeout(()=>{
				resolve(extend({}, message, {response:{status:"processed"}}))
			}, message.interval)

		})
		
		.start()
