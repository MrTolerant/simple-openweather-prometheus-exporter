const {
  NODE_PORT = 9091,
  WEATHER_UNITS = 'metric',
  WEATHER_TOKEN = '',
  WEATHER_CITY = 'moscow',
  WEATHER_UPDATE_INTERVAL = 5000
} = process.env

const weatherApiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_TOKEN}&units=${WEATHER_UNITS}`

const axios = require('axios')
const app = require('express')()
const promMetrics = require('express-prom-bundle')({ includePath: false })
const client = require('prom-client')
const gauge = new client.Gauge({ name: 'weather_temp', help: 'Current weather temp' })

const updateTemp = async () => {
  try {
    const { data } = await axios.get(weatherApiUrl)
    gauge.set(data?.main?.temp)
  } catch (e) {
    console.log('Erros:', e.message || e)
  }
}

try {
  if (!WEATHER_TOKEN) {
    throw 'Weather API token is Null. Please paste it to WEATHER_TOKEN env variable'
  }
  setInterval(() => {
    updateTemp()
  }, WEATHER_UPDATE_INTERVAL)

  app.use(promMetrics)
  app.listen(NODE_PORT)
  console.log(`Metrics on http://localhost:${NODE_PORT}/metrics`)
  updateTemp()
} catch (error) {
  console.log('Error:', error.message || error)
  process.exit(1)
}
