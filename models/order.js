var winston = require('winston');

var mongoConn = process.env.mongoLabConn;
var mongoose = require('mongoose');
mongoose.connect(mongoConn);

var Schema = mongoose.Schema;
var orderSchema = new Schema({
  id: String,
  email: String,
  name: String,
  address: String,
  postCode: String,
  note: String,
  paymentId: String,
  paid: Boolean,
  status: String,
  date: { type: Date, default: Date.now }
});

var OrderEntity = mongoose.model('Order', orderSchema);

function Order (entity) {
  if (entity) {    
    this.id = entity._id.toString();
    this.email = entity.email;
    this.name = entity.name;
    this.address = entity.address;
    this.postCode = entity.postCode;
    this.note = entity.note;
    this.paymentId = entity.paymentId;
    this.paid = entity.paid;
    this.archived = entity.archived;

    return;
  }

  this.id = '';
  this.email = '';
  this.name = '';
  this.address = '';
  this.postCode = '';
  this.note = '';
  this.paymentId = '';
  this.paid = false;
  this.archived = false;
}


Order.prototype.add = function (next) {
  var entity = new OrderEntity ({
    email: this.email,
    name: this.name,
    address: this.address,
    postCode: this.postCode,
    note: this.note,
    paymentId: this.paymentId,
    paid: false,
    archived : false
  });

  entity.save(function (err, entity) {
    if (err) {
      winston.info('[%s][%s] %s', new Date().toISOString(), sessionId, err);
      next(err);
    }

    next();
  }); 

}

Order.prototype.update = function (next) {

  var order = this;

  OrderEntity.findById(this.id, function (err, entity) {
    if (err) {
      next(err);
    }

    entity.email = order.email;
    entity.name = order.name;
    entity.address = order.address;
    entity.postCode = order.postCode;
    entity.note = order.note;
    entity.paymentId = order.paymentId;
    entity.paid = order.paid;
    entity.archived = order.archived;
    
    entity.save(function (err, entity) {
      if (err) {
        next(err);
      }

      next();
    });    

  });
}

Order.find = function (next) {

  OrderEntity.find(function (err, entities) {
    if (err)
      return next(err);

    winston.info('[%s] %s %s', new Date().toISOString(), 'total orders: ', entities.length);
    return next(null, entities);
  });

};

Order.findByPaymentId = function (paymentId, next) {
  winston.info('[%s] %s', new Date().toISOString(), 'paymentId', paymentId);

  OrderEntity.findOne({ paymentId: paymentId }, function (err, entity) {
    if (err) {
      next(err);
    }

    var order = new Order(entity);
    next(null, order);
  });

}

Order.findById = function (id, next) {
  winston.info('[%s] %s', new Date().toISOString(), 'id', id);  

  OrderEntity.findById(id, function (err, entity) {
    if (err){
      next(err);
    }

    var order = new Order(entity);
    next(null, order);

  })
}


module.exports = Order;