const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE, { useNewUrlParser: true }, () => {
	console.log('Connect to database');
})

const { User } = require('./models/user');
const { Home } = require('./models/home');
const { auth } = require('./middelware/auth');

app.use(bodyParser.json());
app.use(cookieParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('../client/build'));

// GET //
app.get('/api/auth', auth, (req, res) => {
	res.json({
		isAuth: true,
		id: req.user._id,
		email: req.user.email,
		name: req.user.name,
		lastname: req.user.lastname
	})
})

app.get('/api/logout', auth, (req, res) => {
	req.user.deleteToken(req.token, (err, user) => {
		if(err) return res.status(400).send(err);
		res.sendStatus(200);
	})
})

app.get('/api/homes', (req, res) => {
	Home.find({}).limit(10).exec((err, homes) => {
		if(!homes.length) return res.json({
			success: false
		});

		return res.json({
			homes,
			success: true
		})
	})
});

app.get('/api/home/main', (req, res) => {
	Home.findOne({ rating: 5 }).exec((err, home) => {

		return res.json(home)
	})
});

app.get('/api/homes/filter', (req, res) => {
	Home.find({ title: { $regex: req.query.path, $options: 'i' }}).exec((err, homes) => {
		if(!homes.length) return res.json({
			success: false
		});

		return res.json({
			homes,
			success: true
		})
	})
});

app.get('/api/home/:id', (req, res) => {
	const id = req.params.id;

	Home.findById(id).exec((err, home) => {
		if(!home) return res.json({
			success: false
		});

		return res.json({
			home,
			success: true
		})
	})
});

app.post('/api/home/:id/comment', (req, res) => {
	const id = req.params.id;
	
	Home.findByIdAndUpdate(id, { $push: { comments: req.body.comment }}, (err, doc) => {
		if(err) return res.json({
			success: false
		});

		return res.json({
			home: doc,
			success: true
		})
	});
});

app.post('/api/register', (req, res) => {
	const user = new User(req.body);

	user.save((err, doc) => {
		if(err) return res.json({
			success: false
		})

		res.status(200).json({
			success: true,
			user: doc
		})
	})
})

app.post('/api/login',(req,res) => {
	User.findOne({'email':req.body.email}, (err, user) => {
		if(!user) return res.json({isAuth: false, message: 'Auth failed, email not found'});
        const self = user;

		user.comparePassword(req.body.password, (err, isMatch) => {
			if(!isMatch) {
                return res.json({
                    isAuth: false,
                    message: 'Wrong password'
                })
            } else {
                self.generateToken((err, user) => {
                    if(err) return res.status(400).send(err);
        
                    res.cookie('auth', user.token).json({
                        isAuth: true,
                        id: user._id,
                        email: user.email
                    })
                })
            }
		})
	})
})

if(process.env.NODE_ENV === 'production'){
	const path = require('path');
	app.get('/*',(req,res) =>{
		res.sendFile(path.resolve(__dirname,'../client','build','index.html'))
	})
}

const port = process.env.PORT || 3001;
app.listen(port,() => {
	console.log(`Server start on the port ${port}`)
})