const {Pool} = require('pg')
const config = require('../config/config')

const pool = new Pool(config.pgDatabase)

export function run(sql, params) {
	return pool.connect()
		.then(client => {
			return client.query(sql, params)
		})
		.then(res => {
			client.release()
			return res
		})
		.catch(err => {
			client.release()
			throw err
		})
}