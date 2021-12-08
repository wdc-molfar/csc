const Controller = require("./controller")
const startProcess = require("./slave")


const Service  = class {
	#options
	#controller
	#exposedMethods

	constructor (options){
		this.#exposedMethods = []
		this.#options = options
		this.#controller = new Controller(this.#options)
		this.use("__exposed", (data, resolve) => {
			resolve(this.#exposedMethods)
		})
	}

	use (route, callback){
		this.#controller.use(route, callback)
		this.#exposedMethods.push(route)
		return this
	}

	start(){
		startProcess(this.#controller)
	}
}

module.exports = Service