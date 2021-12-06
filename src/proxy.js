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
	
	let forkedProcess = await fork(options.path)
	let _instance_id = options.id
	let _instance_name = options.name
	let _instance_path = options.path

	forkedProcess.id = _instance_id 

	forkedProcess.execute = (command, options) => new Promise ( (resolve, reject) => {
		
		let _request_id = v4() 
		
		let cb;
		cb = response => {
			// if(response._request_id == _request_id) {
				if( response.error ){
					reject(new ServiceError( `on ${_instance_path} ( instance:${_instance_id} ) : ${deserializeError(response.error)}`))
				} else {
					resolve(response)
				}	
				forkedProcess.removeListener("message", cb)
			// }	
		}
		
		forkedProcess.on("message", cb)
		setTimeout( () => { forkedProcess.send( extend( {
				_request_id, 
				_instance_id,
				_instance_name,
				_instance_path

			}, 
			{ 
				_command: command 
			}, 
			options ) 
		)},0)
	})

	forkedProcess.terminate = () => { forkedProcess.kill()}	 
	
	return forkedProcess
}
