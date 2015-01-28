var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'simplelifeuk@gmail.com',
    pass: process.env.mail_pass
  }
});

transporter.sendMail({
  from: 'glitter@dropyourenemiesglitter.com',
  to: 'andrew.chaa@yahoo.co.uk',
  subject: 'Test',
  html: '<h1>Test Html</h1>'
});
