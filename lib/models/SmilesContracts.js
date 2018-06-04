const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SmilesContracts = new Schema({
    userID: {
        required: true,
        type: String,
        unique: true
    },
    name: {
        required: true,
        type: String
    },
    contractAddress: {
        required: true,
        type: String
    },
    partnerIDs:{
        type: Array
    }
});


module.exports = mongoose.model('SmilesContracts', SmilesContracts, 'DApp' );
