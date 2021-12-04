const { Container } = require("../../../index")


const MolfarContainer = class extends Container {

	async startInstance(service, options) {
		let instance = await super.startInstance(service)
		let res  = await instance.execute("_init", options)
		console.log("initiate", res)
		return instance
	}

}

module.exports = MolfarContainer