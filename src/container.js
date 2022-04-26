const Proxy = require("./proxy")
const {v4} = require("uuid")
const {find, isFunction} = require("lodash")
const {deploy} = require("./util")


const ContainerError = class extends Error {
    constructor(message) {
        super(message);
        this.name = "EDQP Container Error";
    }
}

const Container = class {
	
	#holder

	constructor (){
		this.#holder = []
	}

	hold(servicePath, serviceName){
		if( serviceName ) {
			let service = find(this.#holder, s => s.name == serviceName)
			if (!service){
				this.#holder.push({
					id:v4(),
					path: servicePath,
					name: serviceName
				})
			} else {
				service = {
					id:v4(),
					path: servicePath,
					name: serviceName
				} 
				// throw new ContainerError(`Doublicate holds of "${serviceName}" is not available.`)
			}	
		} else {
			let service = find(this.#holder, s => s.path == servicePath)
			if (!service){
				this.#holder.push({
					id:v4(),
					path: servicePath
				})
			} else {
				service = {
					id:v4(),
					path: servicePath
				}
				// throw new ContainerError(`Doublicate holds of "${servicePath}" is not available.`)
			}	
		}
		
		return this
	}

	async deploy(url, DEPLOYMENT_DIR, name) {
		const deployment = await deploy(url, DEPLOYMENT_DIR)
		// this.hold(deployment.servicePath, name)
		return deployment //deployment.servicePath
	}

	
	getService(predicate){
		if (predicate && isFunction(predicate)){
			const service = find(this.#holder, predicate)
			return (service.length && service.length == 1) ? service[0] : service	
		} else {
			return this.#holder
		}
	}

	async startAll(){
		await Promise.all( this.#holder.map( async s => {
			s.instance = await Proxy(s)
		}))
	}

	async startInstance(service){
		if( !service.instance ){
			service.instance = await Proxy(service)
			return service.instance
		}
		return service.instance 
	}

	terminateInstance(service){
		if( service.instance ) {
				service.instance.terminate()
		} else {
			if (service.terminate) service.terminate()
		}
		let s = find(this.#holder, s => s.id == service.id)
		s.instance = null
	}

	terminateAll(){
		this.#holder.forEach( s => {
			if( s.instance ) {
				s.instance.terminate()
				s.instance = null
			}
		})
	}


}


module.exports = Container
