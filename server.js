const express = require( 'express' );
const bodyParser = require('body-parser');
const morgan = require('morgan');
const validateApiKey = require ('./middleware/validate-bearer-token');
const cors = require("./middleware/cors");
const {Students} = require('./modules/studentModule');
const mongoose = require('mongoose');
const {DATABASE_URL,PORT} = require('./config');

const app = express();
const jsonParser = bodyParser.json();

function middleware(req, res, next)
{
    console.log("Middleware");
    req.test = {};
    req.text.message = "Adding something to the request";
    next();
}

app.use(cors);
app.use(express.static("public"));
app.use(morgan('dev'));
app.use(validateApiKey);


let listOfStudents = [
    {
        name : "Marcel",
        id : 123
    },
    {
        name: "Martha",
        id : 456
    },
    {
        name : "Julieta",
        id : 789
    },
    {
        name : "Alfredo",
        id : 847
    }
];

app.get( '/api/students', ( req, res ) => {
    console.log( "Getting all students" );
    console.log(req.test);
    console.log("headers", req.headers);

    Students
        .getAllStudents()
        .then(result=>{
            return res.status( 200 ).json( result );
        });
});

app.get( '/api/studentById', ( req , res ) =>{
   console.log( "Getting student by Id using query string" );
   console.log( req.query );

   let id  = req.query.id;

   if( !id )
   {
       res.statusMessage = "Please send the 'id' as parameter";
       return res.status( 406 ).end();
   }

   let result = listOfStudents.find( (student) => {
        if( student.id == id )
        {
            return student;
        }
   });

   if( !result )
   {
       res.statusMessage = `The are no students with the provided id=${id}`;
       return res.status( 404 ).end();
   }

    return res.status( 200 ).json( result );
});

app.get( '/api/getStudentById/:id', ( req , res ) =>{
    console.log( "Getting student by Id using the integrated param" );
    console.log( req.params );

    let id = req.params.id;

    let result = listOfStudents.find( (student) => {
        if( student.id == id )
        {
            return student;
        }
    });

    if( !result )
    {
        res.statusMessage = `The are no students with the provided id=${id}`;
        return res.status( 404 ).end();
    }

    return res.status( 200 ).json( result );
});

app.post( '/api/createStudent', jsonParser, ( req, res ) => {
    console.log( "Adding a new student to the list." );
    console.log( "Body ", req.body );

    let name = req.body.name;
    let id = req.body.id;

    console.log( "name", name);
    console.log( "id", id);

    if( !id || !name ){
        res.statusMessage = "One of these parameters is missing in the request: 'id' or 'name'.";
        return res.status( 406 ).end();
    }

    if( typeof(id) !== 'number' ){
        res.statusMessage = "The 'id' MUST be a number.";
        return res.status( 409 ).end();
    }

    const newStudent ={
        id,
        name
    };

    Students
        .createStudent(newStudent)
        .then(result=>{
            return res.status(201).json(result);
        })
        .catch(err=>{
            return res.statusMessage = "Something went wrong with the database";
            return res.status(500).end();
        });
});

app.delete('/api/removeStudent', (req,res) =>
{
    let id  = req.query.id;

    if(!id)
    {
        res.statusMessage = "Please send the id";
        return res.status(406).end();
    }

    let itemToRemove = listOfStudents.findIndex((student)=>{
       if(student.id === Number(id))
       {
           return true;
       }
    });

    if(itemToRemove < 0)
    {
        res.statusMessage = "The id was not found in the list of students";
        return res.status(404).end();
    }

    listOfStudents.splice(itemToRemove,1);
    return res.status( 204 ).end();
});

app.listen( PORT, () => {
    console.log( "This server is running on port 8080" );

    new Promise( ( resolve, reject ) => {

        const settings = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        };
        mongoose.connect( DATABASE_URL, settings, ( err ) => {
            if( err ){
                return reject( err );
            }
            else{
                console.log( "Database connected successfully." );
                return resolve();
            }
        })
    })
    .catch( err => {
        console.log( err );
    });
});

//http://localhost:8080/api/students

//http://localhost:8080/api/getStudentById/123

