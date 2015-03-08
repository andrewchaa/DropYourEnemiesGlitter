var Order = require('../models/order');

describe("When order is instantiated", function () {
  
  it("has default values", function () {
    var order = new Order();
    expect(order.id).toBe('');
    expect(order.email).toBe('');
    expect(order.name).toBe('');
    expect(order.address).toBe('');
    expect(order.postCode).toBe('');
    expect(order.note).toBe('');
    expect(order.paymentId).toBe('');
    expect(order.paid).toBe(false);
    expect(order.env).toBe('dev');
    expect(order.status).toBe('received');

  });

});

describe("When order is instantiated with entity", function () {
  
  it("copy values from the entity", function () {
    var entity = {
      _id: '_id',
      email: 'email',
      name: 'name',
      address: 'address',
      postCode: 'postCode',
      note: 'note',
      paymentId: 'paymentId',
      paid: true,
      env: 'live',
      status: 'processing'
    }

    var order = new Order(entity);
    expect(order.id).toBe('_id');
    expect(order.email).toBe('email');
    expect(order.name).toBe('name');
    expect(order.address).toBe('address');
    expect(order.postCode).toBe('postCode');
    expect(order.note).toBe('note');
    expect(order.paymentId).toBe('paymentId');
    expect(order.paid).toBe(true);
    expect(order.env).toBe('live');
    expect(order.status).toBe('processing');    

  });

});

describe('When order and entity converion happens', function () {
  it ('should copy values from the order to an entity', function () {
    var order = new Order();
    var entity = order.toEntity();

    expect(entity.id).toBe('');
    expect(entity.email).toBe('');
    expect(entity.name).toBe('');
    expect(entity.address).toBe('');
    expect(entity.postCode).toBe('');
    expect(entity.note).toBe('');
    expect(entity.paymentId).toBe('');
    expect(entity.paid).toBe(false);
    expect(entity.env).toBe('dev');
    expect(entity.status).toBe('received');    
  });

})