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
    expect(order.archived).toBe(false);

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
      archived: true
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
    expect(order.archived).toBe(true);

  });

});