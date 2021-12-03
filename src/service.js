const Controller = require("./controller")
const startProcess = require("./slave")


const Service  = class {
	#options
	#controller

	constructor (options){
		this.#options = options
		this.#controller = new Controller(this.#options)
	}

	use (route, callback){
		this.#controller.use(route, callback)
		return this
	}

	start(){
		startProcess(this.#controller)
	}
}

module.exports = Service