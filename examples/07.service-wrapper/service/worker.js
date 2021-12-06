 const { Service } = require("../lib/service-wrapper")
 const { AmqpManager, Middlewares, yaml2js, getMetrics } = require("@molfar/amqp-client")

 let service = new Service({
    consumer: null,
    config: null,

    async onConfigure( config, resolve ){
      this.config = config
    
      console.log("configure worker", this.config._instance_id)
      
      this.consumer = await AmqpManager.createConsumer(this.config.service.consume)
      
      await this.consumer.use([
      Middlewares.Json.parse,
      Middlewares.Schema.validator(this.config.service.consume.message),
      Middlewares.Error.Log,
      Middlewares.Error.BreakChain,

      (err, msg, next) => {
        setTimeout(() => {
          console.log(
            `Worker ${this.config._instance_id} process: ${msg.content.timeout}ms`,
          );
          msg.ack();
        }, msg.content.timeout);
      }
    ])
      
      resolve({status: "configured"})
   
    },

    onStart(data, resolve){
      console.log("start worker", this.config._instance_id)
      this.consumer.start()
      resolve({status: "started"}) 
    },

    async onStop(data, resolve){
      console.log("stop worker", this.config._instance_id)
      await this.consumer.close()
      resolve({status: "stoped"})  
    }

 })

 service.start()
