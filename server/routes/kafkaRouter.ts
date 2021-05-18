//** Requiring in express.Router**//

const expressKafka = require('express');
const routerKafka = expressKafka.Router();

//** Path to file controllers**//
const userControllerKafka = require("../controllers/userController.ts");
const dbControllerKafka = require("../controllers/dbController.ts");
const kafkaControllerKafka = require("../controllers/kafkaController.ts");
const cookieControllerKafka = require("../controllers/cookieController.ts");

// routerKafka.get('/startproducer', kafkaControllerKafka.startproducer, (req, res) => {
//   console.log('done');
//   res.status(200)
// })

// routerKafka.get('/startconsumer', kafkaControllerKafka.startconsumer, (req, res) => {
//   console.log('done');
//   res.status(200)
// })

routerKafka.get('/messageData', kafkaControllerKafka.getMessageData, (req, res) => {
  // console.log('done');
  const { messageData } = res.locals;
  res.status(200).json({messageData: messageData})
})

module.exports = routerKafka;