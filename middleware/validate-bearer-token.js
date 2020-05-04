
const {TOKEN} = require('./../config');

function validateApiKey(req,res,next)
{
    if(!req.headers.authorization)
    {
        res.statusMessage = "Unauthorized request. please send the API key";
        return res.status( 401 ).end();
    }
    if(req.headers.authorization !== `Bearer ${TOKEN}`)
    {
        res.statusMessage = "Unauthorized request. Invalid API key";
        return res.status( 401 ).end();
    }
    next();
}

module.exports = validateApiKey;