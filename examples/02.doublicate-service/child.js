
	const { Service } = require("../../index")

	const service = new Service()

	service
		.use("interval", (message, resolve) => {
			setTimeout(()=>{
				resolve({status:"processed"})
			}, message.interval)

		})
		.start()
