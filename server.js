const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const Products = require('./Product');
const User = require('./User');
const stripe = require('stripe')("sk_test_51J8IBqSGHtTqz56onK0025gT4bDDcaZnPsbezgyIpBayskDBzTjkNaH73FmjcfpGpeIDYvdx3KLt8AfjBD3N1TIM00Wr1Lmj27") ;
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Orders = require('./Order');

dotenv.config({path:'./config.env'});

const port = 3001;

//Middleware
app.use(express.json());
app.use(cors());

//Connection Url

const url = 'mongodb+srv://AVANISH_SRIVAS:lghYjbTuf8YSQjFW@cluster0.5xsug.mongodb.net/Cluster0?retryWrites=true&w=majority'

//Connecting our app to our mongoDB database using mongoose

async function connect(){
    try{
     await mongoose.connect(url);
     console.log('Connected to mongodb atlas');
    }catch(error){
     console.error(error);
    }
   }
   
   connect();

//API

app.get('/', (req,res)=>{
    res.status(200).send('Hello World');
});

//API for adding product in mongodb database
app.post('/products/add', (req, res)=>{
    const productDetail = req.body;
    console.log('Product Detail>>>>>',productDetail);

    //Here we are adding the productDetail we got from frontend into the schema Products 
    Products.create(productDetail, (err, Data)=>{
        if(err){
            res.status(500).send(err.message);
        }
        else{
            res.status(201).send(Data);
        }
    })
})

//To retrieve data from mongodb database to our server 

app.get('/products/get', (req,res) => {
    Products.find((err, data) => {
       if(err){
        res.status(500).send(err.message);
       }
       else{
        res.status(200).send(data);
        
       }
    })
})

//API for user Registration adding new user to our database

app.post("/user/signup", async (req, res) => {
    const { username, password, name } = req.body;
  
    const encrypt_password = await bcrypt.hash(password, 10);
  
    const userDetail = {
      username: username,
      password: encrypt_password,
      name: name,
    };
  
    const user_exist = await User.findOne({ username: username });
  
    if (user_exist) {
      res.send({ message: "The Email is already in use !" });
    } else {
      User.create(userDetail, (err, result) => {
        if (err) {
          res.status(500).send({ message: err.message });
        } else {
          res.send({ message: "User Created Succesfully" });
        }
      });
    }
  });



// app.post('/user/signup', async (req,res)=>{
//     //here we are using object destructuring to get the fields filled by the user at frontend registration page
//     const { name, username, password, confirmPassword } = req.body;

//     if(!name || !username || !password || !confirmPassword){
//         return res.status(422).json({error: "You need to fill up the required field"});
//     }

//     try {

//       const userExist = await User.findOne({username: username});

    
//     if(userExist){
//         return res.status(422).json({error: "Email already exists"});
//     }else if(password != confirmPassword){
         
//         return res.status(422).json({error: "password is not matching"});

//     } 
//     else{
       
//         //here we are mapping our database fields with the fields filled by the user at the registration page by creating a new instance of User
//      const user = new User({ name, username, password, confirmPassword })

//      //Before saving our data to the database on mongodb atlas we will first make our filled password safe by hashing it so it will remain hidden from everyone
 
 
//      const result = await user.save();
 
//      if(result){
//          res.status(201).json({message:'user has successfully registered'});
//      }
//      else{
//          res.status(500).json({error:'Failed to register'});
//      } 
//     }
    
     

//   } catch (error) {
//         console.log(error);
//    }

    

// })
//API for Login validation

app.post("/user/login", async (req, res) => {
    const { username, password } = req.body;
    
  
    const userDetail = await User.findOne({ username: username });
    console.log(userDetail);
    if (userDetail) {
      if (await bcrypt.compare(password, userDetail.password)) {
        
        res.send(userDetail);
        
      } else {
        res.send({ error: "invaild Password" });
      }
    } else {
      res.send({ error: "user is not exist" });
    }
  });



//API for Stripe Payment

app.post('/payment/create', async (req, res)=>{
    const total = req.body.amount;
    console.log('total payment request recieved', total);

    const payment = await stripe.paymentIntents.create({
        amount: total * 100,
        currency: 'inr',
    });
    res.status(201).send({
        clientSecret: payment.client_secret,

    });
});

//API to store order details inside database

app.post('/orders/add', (req, res)=>{
    const products = req.body.basket;
    const price = req.body.price;
    const username = req.body.username;
    const address = req.body.address;

    const orderDetail = {
        products:products,
        price:price,
        address: address,
        username: username,

    };
    Orders.create(orderDetail, (err, result)=>{
      if(err){
        console.log(err);
      }else{
        console.log('Your Order added to database >>>>', result);
      }
    })
})

app.post("/orders/get", (req, res) => {
  const username = req.body.username;

  Orders.find((err, result) => {
    if (err) {
      console.log(err);
    } else {
      const userOrders = result.filter((order) => order.username === username);
      res.send(userOrders);
    }
  });
});

//DEMO API
app.get('products/add', (req, res)=>{
    res.send("Hiiiii!!");
})

app.listen(port, ()=>{
    console.log('Server is running at port', port);
});