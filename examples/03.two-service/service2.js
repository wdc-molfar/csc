
	const { Service } = require("../../index")
	const { extend } = require("lodash")

	const service = new Service()

	service
		.use("interval", (message, resolve) => {
			const interval = Math.round(Math.random()*3000+1000)
			setTimeout(()=>{
				resolve(extend({}, message, {response:{status:"processed", interval}}))
			}, interval)

		})
		.start()
