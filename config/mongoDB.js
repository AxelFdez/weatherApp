require('dotenv').config();

const mongoose = require('mongoose');
// Connexion à MongoDB
async function connectBdd(){
	mongoose.connect(process.env.MONGODB_URI)
	// .then(() => console.log('Connexion à MongoDB réussie !'))
	.catch((err) => console.log('Connexion à MongoDB échouée !', err));
}

module.exports = connectBdd;