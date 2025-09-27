const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/rentkro')
  .then(async () => {
    console.log('Connected ✅');

    const result = await mongoose.connection.collection('users').dropIndex('email_1');
    console.log('Index dropped 🗑️:', result);

    process.exit();
  })
  .catch(err => {
    console.error('❌ Error dropping index:', err.message);
    process.exit(1);
  });

