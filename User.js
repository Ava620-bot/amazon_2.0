const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    confirmPassword: String,
    tokens:[
        {
          token: {
            type: String,
            required: true
          }  
        }
    ]

})



//we are creating the token here using the methods.generateAuthToken function which returns
userSchema.methods.generateAuthToken = async function(){
    try {
         let tokenGenerate = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
         //here we are storing the token created above to our database tokens field array inside token
         this.tokens = await this.tokens.concat({token: tokenGenerate});
         await this.save();
         return tokenGenerate;
    } catch (error) {
        console.log(error);
        
    }
}

module.exports = mongoose.model('users', userSchema);