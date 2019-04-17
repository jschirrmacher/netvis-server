module.exports = function ({logger}) {
  const MongoClient = require('mongodb').MongoClient

  return function (mongoURL, dbName) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoURL, {useNewUrlParser: true}, function (err, client) {
        if (err) {
          reject(err)
        }
        const db = client.db(dbName)
        logger.info(`Successfully logged into MongoDB '${dbName}'`)

        db.listCollections().toArray((err, docs) => {
          if (err) {
            reject(err)
          }

          const map = Object.assign({}, ...docs.map(collection => ({
              [collection.name]: ({
                find(where, fields) {
                  return new Promise((resolve, reject) => {
                    db.collection(collection.name).find(where, fields).toArray((err, docs) => {
                      if (err) {
                        reject(err)
                      }
                      resolve(docs)
                    })
                  })
                }
              })
            })
          ))
          resolve(map)
        })
      })
    })
  }
}