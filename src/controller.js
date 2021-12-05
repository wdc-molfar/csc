const { find, extend } = require("lodash")
const {serializeError, deserializeError} = require("./util")

const ControllerError = class extends Error {
    constructor(message) {
        super(message);
        this.name = "EDQP Service Controller Error";
    }
}



class Controller {
	constructor(options = {commandIdProperty:"_command"}){
		this.options = options
		this.callbacks = []	
	}

	callback(command, resolve) {

		let executor = 	find(this.callbacks, item => item[this.options.commandIdProperty] == command[this.options.commandIdProperty]) 
						|| 
						{
							callback: () => {
								resolve(extend(command, {
									// response:{
										error: serializeError( new ControllerError(`Command "${command[this.options.commandIdProperty]}" not found`))
									// }
								}
							))}
						}
		try {
			executor.callback(command, resolve)
		} catch (e) {
			resolve(extend(command, {
				// response:{
					error: serializeError(e)
				// }
			}))
		}		
	}

	add(route, callback){
		let cb = {
			callback
		}
		cb[this.options.commandIdProperty] = route
		this.callbacks.push(cb)
		return this
	}

	use(route, callback){
		return this.add(route, callback)
	}	
}


module.exports = Controller


