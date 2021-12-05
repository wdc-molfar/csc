
	const { Service } = require("../../index")
	const { extend } = require("lodash")

	const service = new Service()

	service
		.use("interval", (message, resolve) => {
			setTimeout(()=>{
				resolve({status:"processed"})
			}, message.interval)

		})
		.start()
