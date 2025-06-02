require('dotenv').config()
const express = require('express')
const cors = require('cors')


const app = express()
app.use(cors())
app.use(express.json())

// Test route
app.get('/', (req, res) => {
  res.send('Service d\'authentification opérationnel 🚀')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`))
