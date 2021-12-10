const Controller = require("./controller")
const startProcess = require("./slave")


const Service  = class {
	#options
	#controller
	#exportedMethods

	constructor (options){
		this.#exportedMethods = []
		this.#options = options
		this.#controller = new Controller(this.#options)
		this.use("__exported", (data, resolve) => {
			resolve(this.#exportedMethods)
		})
	}

	use (route, callback){
		this.#controller.use(route, callback)
		this.#exportedMethods.push(route)
		return this
	}

	start(){
		startProcess(this.#controller)
	}
}

module.exports = Service