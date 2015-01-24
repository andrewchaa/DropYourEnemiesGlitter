var azure = require('azure-storage');
var uuid = require('node-uuid');
var tableName = 'orders';
var partitionKey = process.env.azure_partition_key;
var storageAccount = process.env.AZURE_STORAGE_ACCOUNT;
var storageAccessKey = process.env.AZURE_STORAGE_ACCESS_KEY;
var tableService = azure.createTableService(storageAccount, storageAccessKey);
var bunyan = require('bunyan');
var log = bunyan.createLogger({ 
  name: 'order',
  serializers: bunyan.stdSerializers
});

function Order (row) {
  if (row) {
    this.PartitionKey = row.PartitionKey._;
    this.RowKey = row.RowKey._;
    this.email = row.email._;
    this.name = row.name._;
    this.address = row.address._;
    this.postCode = row.postCode._;
    this.note = row.note._;
    this.paymentId = row.paymentId._;
    this.paid = row.paid._;

  } else {

    this.PartitionKey = partitionKey;
    this.RowKey = uuid();
    this.email = '';
    this.name = '';
    this.address = '';
    this.postCode = '';
    this.note = '';
    this.paymentId = '';
    this.paid = false;
  }
}


tableService.createTableIfNotExists(tableName, function (error) {
  if (error)
    throw error;
});

Order.prototype.add = function (next) {
  var entity = {
    PartitionKey: {'_': this.PartitionKey},
    RowKey: {'_': this.RowKey},
    email: {'_': this.email},
    name: {'_': this.name},
    address: {'_': this.address},
    postCode: {'_': this.postCode},
    note: {'_': this.note},
    paymentId: {'_': this.paymentId},
    paid: {'_': false}
  }

  tableService.insertEntity(tableName, entity, function (err) {
    if (err)
      next(err);

    next(null);
  });
}

Order.prototype.update = function (next) {

  var entity = {
    PartitionKey: {'_': this.PartitionKey},
    RowKey: {'_': this.RowKey},
    email: {'_': this.email},
    name: {'_': this.name},
    address: {'_': this.address},
    postCode: {'_': this.postCode},
    note: {'_': this.note},
    paymentId: {'_': this.paymentId},
    paid: {'_': this.paid}
  }

  tableService.updateEntity(tableName, entity, function (error, result, response) {
    if (error) {
      next(error);
    }

    next(null);
  });

}

Order.findByRowKey = function (rowKey, next) {
  tableService.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, response) {
    if (error) {
      next(error);
    }

    log.info('result: ', result);
    next(null, new Order(result));
  })
}

Order.findByPaymentId = function (paymentId, next) {
 log.info('paymentId', paymentId);

  var query = new azure.TableQuery().where("paymentId eq ?", paymentId);
  tableService.queryEntities(tableName, query, null, function (err, result, response) {
    if (err)
      next(err);

    log.info('result', result.entries[0]);
    log.info('response', response)

    var order = new Order(result.entries[0]);
    next(null, order);
  });

}

module.exports = Order;