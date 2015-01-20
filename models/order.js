function Order (id, email, name, address, postCode, note) {
  this.id = id || '';
  this.email = email || '';
  this.name = name || '';
  this.address = address || '';
  this.postCode = postCode || '';
  this.note = note || '';
}

var azure = require('azure-storage');
var uuid = require('node-uuid');

var tableName = 'orders';
var partitionKey = 'myOrders';
var storageAccount = process.env.AZURE_STORAGE_ACCOUNT;
var storageAccessKey = process.env.AZURE_STORAGE_ACCESS_KEY;

var entityGen = azure.TableUtilities.entityGenerator;
var tableService = azure.createTableService(storageAccount, storageAccessKey);
var TableQuery = azure.TableQuery;

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
  this.id = uuid();
  var orderEntity = {
    PartitionKey: entityGen.String(partitionKey),
    RowKey: entityGen.String(this.id),
    id: entityGen.String(this.id),
    email: entityGen.String(this.email),
    name: entityGen.String(this.name),
    address: entityGen.String(this.address),
    postCode: entityGen.String(this.postCode),
    note: entityGen.String(this.note)
  }

  tableService.insertEntity(tableName, orderEntity, function (err) {
    if (err)
      next(err);

    next(null);
  });
}

Order.findById = function (id, next) {
  tableService.retrieveEntity(tableName, partitionKey, id, function (error, result, response) {
    if (error) {
      next(error);
    }

    next(null, convertToOrderFrom(result));
  })

}

module.exports = Order;