const { fork } = require("child_process")
const { v4 } = require("uuid")
const { extend } = require("lodash")
const {serializeError, deserializeError} = require("./util")

const ServiceError = class extends Error {
    constructor(message) {
        super(message);
        this.name = "Service Error";
    }
}

module.exports = async function (options) {

	const RESERVED_NAMES = [
		"id",
		"on",
		"send",
		"removeListener",
		"execute",
		"terminate"
	]
	
	let forkedProcess = await fork(options.path)
	let _instance_id = options.id
	let _instance_name = options.name
	let _instance_path = options.path

	forkedProcess.id = _instance_id 

	let resolveResult
	let rejectResult

	let cb = response => {
				if( response.error ){
					rejectResult(new ServiceError( `on ${_instance_path} ( instance:${_instance_id} ) : ${deserializeError(response.error)}`))
				} else {
					resolveResult(response)
				}	
		}
		
	forkedProcess.on("message", cb)
	
	forkedProcess.on("error", e => {
		rejectResult(e.toString())
	})



	forkedProcess.execute = (command, options) => new Promise ( (resolve, reject) => {
		
		let _request_id = v4() 

		resolveResult = resolve
		rejectResult = reject
		
		setTimeout( () => { 
			
				forkedProcess.send( extend( {
					_request_id, 
					_instance_id,
					_instance_name,
					_instance_path

				}, 
				{ 
					_command: command 
				}, 

				options))
		}
		,0)
	})
	
	let response  = await forkedProcess.execute("__exported")
	
	response.data.forEach( method => {
		if( RESERVED_NAMES.includes(method) ) throw new ServiceError(`Cannot expose "${method}" method. This is reserved name.`)
		forkedProcess[method] = async data => await forkedProcess.execute(method, data) 
	})

	forkedProcess.terminate = () => { forkedProcess.kill()}	 
	
	return forkedProcess
}
