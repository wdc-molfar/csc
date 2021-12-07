const Service  = require("./service")
const { extend, isFunction, lowerFirst } = require("lodash")

const ServiceWrapper = class extends Service {

	constructor(instance){
		super()
		extend(this, instance)
		let commands = Object.keys(this).filter( key => isFunction(this[key]) && /^on[A-Z]+\w*/g.test(key))
		commands.forEach( c => {
			let commandName = lowerFirst(c.replace("on", ""))
			this.use(commandName, (data, resolve) => {
				this[c](data, resolve)
			})
		})
	}
}

module.exports = ServiceWrapper
