var azure = require('azure-storage');
var uuid = require('node-uuid');
var tableName = 'orders';
var partitionKey = process.env.azure_partition_key;
var storageAccount = process.env.AZURE_STORAGE_ACCOUNT;
var storageAccessKey = process.env.AZURE_STORAGE_ACCESS_KEY;
var tableService = azure.createTableService(storageAccount, storageAccessKey);
var winston = require('winston');
var entityHelper = require('../helpers/entityHelper');

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
    this.date = row.Timestamp._;

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

Order.find = function (next) {

  var query = new azure.TableQuery().top(30).where("PartitionKey eq ?", partitionKey);

  tableService.queryEntities(tableName, query, null, function (err, result) {
    if (err) {
      next(err);
    } else {

      next(null, result.entries.map(function (row) {
        return {
          PartitionKey: entityHelper.string(row.PartitionKey),
          RowKey: entityHelper.string(row.RowKey),
          email: entityHelper.string(row.email),
          name: entityHelper.string(row.name),
          address: entityHelper.string(row.address),
          postCode: entityHelper.string(row.postCode),
          note: entityHelper.string(row.note),
          paymentId: entityHelper.string(row.paymentId),
          paid: entityHelper.string(row.paid),
          date: entityHelper.date(row.Timestamp)
        }
      }));
    }
  });
};


Order.findByRowKey = function (rowKey, next) {
  tableService.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, response) {
    if (error) {
      next(error);
    }

    winston.info('result: ', result);
    next(null, new Order(result));
  })
}

Order.findByPaymentId = function (paymentId, next) {
 winston.info('paymentId', paymentId);

  var query = new azure.TableQuery().where("paymentId eq ?", paymentId);
  tableService.queryEntities(tableName, query, null, function (err, result, response) {
    if (err)
      next(err);

    winston.info('result', result.entries[0]);
    winston.info('response', response)

    var order = new Order(result.entries[0]);
    next(null, order);
  });

}

module.exports = Order;