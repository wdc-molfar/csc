const { Service } = require("../../../index")

const MolfarService = class extends Service {
	 
	  onInit(callback){
	 	this.use("_init", callback)
	 	return this
	 }
}

module.exports = MolfarService