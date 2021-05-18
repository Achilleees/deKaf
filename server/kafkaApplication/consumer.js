const { Kafka } = require('kafkajs');
const { logLevel } = require('kafkajs')
const winston = require('winston')
const fs = require('fs')
const path = require('path')

const dataStructures = require('../dataStructures/queue.js')
const db = require('../models/userModel');


//initializing a consumer object
const consumer = {}

//everything in this function will be the consumer logic
consumer.run = async (userId) => {
  try 
  {
    //this winston function will be to track errors and store them in a log
    const toWinstonLogLevel = level => { switch(level) {
      case logLevel.ERROR:
      case logLevel.NOTHING:
          return 'error'
      case logLevel.WARN:
          return 'warn'
      case logLevel.INFO:
          return 'info'
      case logLevel.DEBUG:
          return 'debug'
  }
}

    const WinstonLogCreator = logLevel => {
      const logger = winston.createLogger({
          level: toWinstonLogLevel(logLevel),
          transports: [
              new winston.transports.Console(),
              new winston.transports.File({ filename: 'myapp.log' })
          ]
      })
  
      return ({ namespace, level, label, log }) => {
          const { message, ...extra } = log
          console.log('test')
          logger.log({
              level: toWinstonLogLevel(level),
              message,
              extra,
          })
      }
  }

  //initializing a new kafka object
    const kafka = new Kafka({
      clientId: 'my-app',
      brokers: ['mike-Desktop:9092'],
      logLevel: logLevel.ERROR,
      logCreator: WinstonLogCreator
    })
    const buffer = new dataStructures()
    //initializing a consumer
    const consumer = kafka.consumer({
      groupId: 'my-group',
      // partitionAssigners: [1,2],
      // sessionTimeout: 30000,
      // rebalanceTimeout: 60000,
      // heartbeatInterval: 3000,
      // metadataMaxAge: 30000,
      // allowAutoTopicCreation: true
    })

    console.log('connection to consumer...')
    //connecting consumer
    await consumer.connect();
    console.log('connected to consumer')
    //subscribing this consumer to the topic
    await consumer.subscribe({
      //add multiple topics later
      topic: 'RandomGeneratedData',
      fromBeginning: true
    })

    console.log('logger')
    const logger = await consumer.logger().info();
    console.log(logger)

    //running the consumer to collect the data being sent from the producer
    //this will be used if the producer wants to send messages in batches
    // await consumer.run({
    //   eachBatchAutoResolve: true,
    //   eachBatch: async ({
    //     batch,
    //     resolveOffset,
    //     heartbeat,
    //     commitOffsetsIfNecessary,
    //     uncommittedOffsets,
    //     isRunning,
    //     isStale,
    //   }) => {
    //     console.log(batch.messages[0].value.toString());
    //     console.log(batch.partition);
    //     // const messageQ = batch.messages[0].value.toString();
    //       // const partition = batch.partition;
         
    //       messageQ = 'this is a test from the batch';
    //       partition = 27;
    //       const queryString = {
    //         text: 'INSERT INTO data (message, partition) VALUES ($1, $2)',
    //         values: [messageQ, partition],
    //         rowMode: 'array'
    //       }
    //       console.log('before query')
    //       await db.query(queryString)
    //       .catch(e => console.log(`error in addTodb`, e));

    //     // console.log(JSON.stringify(batch.message[0].value))
    //     console.log(batch.highWatermark)
    //       // console.log({
    //       //   topic: batch.topic,
    //       //   partition: batch.partition,
    //       //   highWatermark: batch.highWatermark,
    //       //   batch.message: {
    //       //     offset: message.offset,
    //       //     key: message.key.toString(),
    //       //     value: message.value.toString()
    //       //   }
    //       // })
    //       // resolveOffset(message.offset)
    //       await heartbeat()
    //     // }
    //   },
    // })

    //running the consumer again. This one is for the producer sending data as individual messages
    await consumer.run({
      //initializing an async function for the value of eachMessage
      'eachMessage': async ({ topic, partition, message }) => {
        console.log('in the consumer running');

        //querying the main message into the db
        const dataId = await mainMessageQueryFunc(topic, partition, message, userId);
        // console.log(dataId);

        console.log(consumer.events)
        // deconstructing the events our of consumer
        const { REQUEST, FETCH, GROUP_JOIN } = consumer.events;
        const request = requestFunc(REQUEST, dataId);
        const fetch = fetchFunc(FETCH, dataId);
        // console.log(GROUP_JOIN)
        const groupJoin = groupJoinFunc(GROUP_JOIN, dataId)
      }
    })

    //all the query functions will be below:
    //function to query the main message data
    async function mainMessageQueryFunc(topic, partition, message, userId) {
      const messageData = {
        value: message.value.toString(),
        partition: partition,
        topic: topic
      }
      console.log(messageData)
      const testQueryString = {
        text: `INSERT INTO data2 (message, partition) VALUES ($1, $2)`,
        values: ['this is another test', 1],
        rowMode: 'array'
      }
      // const queryString = {
      //   text: 'INSERT INTO consumers (user_id, message_data) VALUES ($1, $2) RETURNING _id AS dataId',
      //   values: [userId, messageData],
      //   rowMode: 'array'
      // }
      console.log('before query')
      // const testQuery = await db.query(testQueryString)
      const result = await db.query(queryString)
      .catch(e => console.log(`error in addTodb`, e));
      // const dataId = result.rows[0][0];
      // console.log(dataId)
      // return dataId;
    }

    async function requestFunc(REQUEST, dataId) {
      const req = consumer.on(REQUEST, (e) => {
        console.log('in the request fun')
        console.log(e)
        const { payload } = e;
        // console.log(payload)
        const queryString = {
          text: 'INSERT INTO consumer_requests (request_data, data_id) VALUES ($1, $2)',
          values: [payload, dataId],
          rowMode: 'array'
        }
        console.log('before query')
        db.query(queryString)
        .catch(e => console.log(`error in addTodb`, e));
        return payload
      })
      console.log(req)
      return req;
    }
    
    function fetchFunc(FETCH) {
      consumer.on(FETCH, (e) => {
        console.log('in the fetch func')
        // console.log(e)
        return e
      })
    }

    function groupJoinFunc(GROUP_JOIN, dataId) {
      consumer.on(GROUP_JOIN, (e) => {
        console.log(e)
      })
    }
  }

  
  catch(e) {
    console.log(`Something bad happened in the consumer ${e}`)
  }
  finally {
    console.log('closed out of consumer')
    // consumer.close()
  }
}
// userId = 3;
// consumer.run(userId);
module.exports = consumer;
