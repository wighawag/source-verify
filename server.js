const express = require('express')
//const bodyParser = require('body-parser');
//const request = require('request');
const serveIndex = require('serve-index')
const fileUpload = require('express-fileupload')
const app = express()
const port = 80

const injector = require('./injector.js')

const repository = '/repository/'

app.use(express.static('public'));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true
}))

app.get('/', (req, res) => res.sendFile('public/index.html'))
app.use('/repository', express.static(repository), serveIndex(repository, {'icons': true}))


app.post('/', (req, res) => {
    let files = []
    for (var x in req.files.files) {
        if (req.files.files[x].data) {
            files.push(req.files.files[x].data.toString())
        } else {
            console.log("File " + x + " invalid!")
        }
    }
    let result = injector.inject(
        repository,
        req.body.chain,
        req.body.address,
        files
    ).then(result => {
        let path = `/repository/contract/${req.body.chain}/${result}/`
        res.send(
            "<html><body>Contract successfully verified!<br/>" +
            `<a href=\"${path}\">${path}</a><br/>` +
            "<a href=\"/\">Verify another one</a>" +
            "</body></html>"
        )
    }).catch(err => {
        console.log("Error!")
        res.send("Error: " + err)
    })
})

app.listen(port, () => console.log(`Injector listening on port ${port}!`))
