var azure = require('azure-storage');
var uuid = require('node-uuid');
var tableName = 'orders';
var partitionKey = 'orders';
var storageAccount = process.env.AZURE_STORAGE_ACCOUNT;
var storageAccessKey = process.env.AZURE_STORAGE_ACCESS_KEY;

function Order () {
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

var tableService = azure.createTableService(storageAccount, storageAccessKey);

tableService.createTableIfNotExists(tableName, function (error) {
  if (error)
    throw error;
});

function convertToOrderFrom(row) {
  var order = {};
  order.id = row.RowKey._;
  order.email = row.email._;
  order.name = row.name._;
  order.address = row.address._;
  order.postCode = row.postCode._;
  order.note = row.note._;

  return order;
}

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

Order.prototype.paid = function () {

  var entity = {
    PartitionKey: {'_': this.PartitionKey},
    RowKey: {'_': this.RowKey},
    email: {'_': this.email},
    name: {'_': this.name},
    address: {'_': this.address},
    postCode: {'_': this.postCode},
    note: {'_': this.note},
    paymentId: {'_': this.paymentId},
    paid: {'_': true}
  }

  tableService.updateEntity(tableName, entity, function (error, result, response) {
    if (error) {
      next(error);
    }

    next(null);
  });

}

Order.findByRowKey = function (id, next) {
  tableService.retrieveEntity(tableName, partitionKey, id, function (error, result, response) {
    if (error) {
      next(error);
    }

    next(null, convertToOrderFrom(result));
  })
}

Order.findByPaymentId = function (paymentId, next) {
  var query = new azure.TableQuery().top(1).where('paymentId eq ' + paymentId, partitionKey);
  tableService.queryEntities(tableName, query, null, function (err, result, response) {
    if (err)
      throw err;

    return result[0];
  });

}

module.exports = Order;