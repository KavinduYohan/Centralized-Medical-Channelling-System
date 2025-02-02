let express = require('express');
let app = express();
const path = require('path');

let methodoverwride = require('method-override');
let dotenv = require('dotenv');

let mongoose = require('mongoose');
let myrouter = require('./routers/router');

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/upload', express.static('upload'));

let session = require('express-session');
let flash = require('connect-flash');

dotenv.config({ path: './config.env' });

// Use process.env.MONGO_URI instead of process.env.mongodburl
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('Error connecting to DB: ', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodoverwride('_method'));
app.use(express.static('public'));

// session middleware
app.use(session({
   secret: 'nodejs',
   resave: true,
   saveUninitialized: true
}));

// flash middleware
app.use(flash());

// Make userId globally available in views
app.use((req, res, next) => {
    res.locals.userId = req.session.userId || null; // Set userId as a global variable in views
    next();
});

// Correct the routes setup (ensure these router files exist)
const patientRouter = require("./routers/patientRouter.js");
const Adrouter = require('./routers/AdminRouter.js');
const doctorRouter = require("./routers/doctorRouter.js");
const Vrouter = require('./routers/Voter.js');
const emprouter = require('./routers/router');  // You may want to verify the correctness of this router

// global variable for operation messages
app.use((req, res, next) => {
    res.locals.sucess = req.flash('sucess');
    res.locals.err = req.flash('err');
    next();
});

// Use routers
app.use('/', myrouter); 
app.use('/upload', express.static('upload'));
app.use(doctorRouter);
app.use(Adrouter);
app.use(myrouter);
app.use(patientRouter);
app.use(Vrouter);

// Fallback port if not provided in the .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`${PORT} Port Working`);
});
