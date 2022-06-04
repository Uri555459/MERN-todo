const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')

const keys = require('./conf/keys')
const port = process.env.PORT || 5000

const app = express()

// Выводить в консоль более информативные логи
app.use(morgan('dev'))
// Настройка запросов
app.use(express.json({ extended: true }))
app.use(cors())

app.use('/api/auth', require('./routes/auth.route'))

const start = async () => {
  try {
    await mongoose
      .connect(keys.mongoURI)
      .then(() => console.log('MongoDB connected.'))

    app.listen(port, () =>
      console.log(`Server has been started on http://localhost:${port}`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
