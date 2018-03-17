const { TransactionProcessor } = require('sawtooth-sdk/processor');
const IntkeyHandler = require('./tp/intkey_handler');

const transactionProcessor = new TransactionProcessor('tcp://localhost:4004');

//Add Transaction Processor Handler to TP
transactionProcessor.addHandler(new IntkeyHandler());
//Start Transaction Processor
transactionProcessor.start();

//Handle Stop Process
process.on('SIGUSR2', () => {
    transactionProcessor._handleShutdown();
})