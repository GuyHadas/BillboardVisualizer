const express = require('express')
const path = require('path')

const app = express()

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

// Serve static files from the public folder
app.use(express.static('public'))

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
})
