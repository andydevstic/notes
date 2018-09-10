const {Pool} = require('pg')
const config = require('../config/config')

const pool = new Pool(config.pgDatabase)

function run(sql, params = []) {
	let dbClient = null
	return pool.connect()
		.then(client => {
			dbClient = client
			return client.query(sql, params)
		})
		.then(res => {
			dbClient.release()
			return res
		})
		.catch(err => {
			dbClient.release()
			throw err
		})
}

module.exports = {
	run
}