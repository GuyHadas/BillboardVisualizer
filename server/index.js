const path = require('path')
const https = require('https')

const express = require('express')
const axios = require('axios');

const app = express()

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/playSong', async (req, res) => {
    const songUrl = req.query.songUrl
    const songResponse = await axios.get(songUrl, {
        responseType: 'arraybuffer',
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    })
    const contentType = songResponse.headers['content-type'] || 'audio/mp4'

    res.set('Content-Type', contentType)
    res.send(songResponse.data)
})

// Serve static files from the public folder
app.use(express.static('public'))

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
})
