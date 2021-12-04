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

	hold(servicePath){
		let service = find(this.#holder, s => s.path == servicePath)
		if (!service){
			this.#holder.push({
				id:v4(),
				path: servicePath
			})
		} else {
			throw new ContainerError(`Doublicate holds of "${servicePath}" is not available.`)
		}
		return this
	}

	async deploy(url) {
		const deployment = await deploy(url)
		this.hold(deployment.servicePath)
		return deployment.servicePath
	}

	
	getService(predicate){
		predicate = (predicate && isFunction(predicate)) ? predicate : ( s => true )
		const service = find(this.#holder, predicate)
		return (service.length && service.length == 1) ? service[0] : service
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
		}
	}

	terminateAll(){
		this.#holder.forEach( s => {
			if( s.instance ) {
				s.instance.terminate()
			}
		})
	}


}


module.exports = Container
