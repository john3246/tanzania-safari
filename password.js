const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 'Amani555jrs';

bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    console.log("Your new hash is:", hash);
});