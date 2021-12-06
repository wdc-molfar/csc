 const { Service } = require("@molfar/csc")
 const { AmqpManager, Middlewares, yaml2js, getMetrics } = require("@molfar/amqp-client")
 

 var consumer
 var instanceConfig
 

 let service = new Service()

 service
  
  .use("configure", async (config, resolve) => {
    
    instanceConfig = config
    
    console.log("configure worker", instanceConfig._instance_id)
    

    consumer = await AmqpManager.createConsumer(config.service.consume)
    
    await consumer.use([
    Middlewares.Json.parse,

    // (err, msg, next) => {
    //   console.log(
    //     "worker", instanceConfig, msg
    //   );
    //   next();
    // },

    Middlewares.Schema.validator(config.service.consume.message),
    Middlewares.Error.Log,
    Middlewares.Error.BreakChain,

    (err, msg, next) => {
      setTimeout(() => {
        console.log(
          `Worker ${instanceConfig._instance_id} process: ${msg.content.timeout}ms`,
        );
        msg.ack();
      }, msg.content.timeout);
    }
  ])
    
    resolve({status: "configured"})
   
  })

  .use("start",  (data, resolve) => {
    console.log("start worker", instanceConfig._instance_id)
    
    consumer.start()
    resolve({status: "started"})  
  })

  .use("stop", async (data, resolve) => {
    console.log("stop worker", instanceConfig._instance_id)
    await consumer.close()
    resolve({status: "stoped"})
  })
  
  .start()
