
const { isFunction } = require("lodash")

const SlaveProcessWrapper = class {
	constructor (callback) {
		this.callback = callback
		this.send = this.emit = this.return = message => { process.send(message) }
		process.on("message", command => {
			(isFunction(this.callback)) ? this.callback(command, this.return) : this.callback.callback(command, this.return)
		}) 
	}
}


module.exports = callback => new SlaveProcessWrapper(callback)


