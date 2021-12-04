const { Container } = require("../../../index")
const deploy = require("./deploy")

const MolfarContainer = class extends Container {

	async startInstance(service, options) {
		let instance = await super.startInstance(service)
		console.log("!!!", instance)
		let res  = await instance.execute("_init", options)
		console.log("initiate", res)
		return instance
	}

	async deployService(url){
		const deployment = await deploy(url)
		console.log(deployment)
		this.hold(deployment.servicePath)
		return deployment.servicePath
	}

}

module.exports = MolfarContainer