
const { isFunction, extend } = require("lodash")
const {serializeError} = require("./util")

const SlaveProcessWrapper = class {

	constructor (callback) {
		this.callback = callback
		
		this.send = 
		this.emit = 
		this.return = message => { 
			process.send( extend(
				{},
				this.request,
				{ data: message }
			)) 
		}
	
		process.on("message", command => {
			try {
				this.request = command
				if (isFunction(this.callback)) {
					this.callback(command, this.return)
				} else {
					this.callback.callback(command, this.return)
				}
			} catch (e) {
				process.send( extend(
					{},
					this.request,
					{ error: serializeError(e) }
				))
			}		
		}) 
	}
}


module.exports = callback => new SlaveProcessWrapper(callback)


