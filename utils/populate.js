
const db = require('../models');

const ANDROID_TOP_100 = 'https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json'
const IOS_TOP_100 = 'https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json'

const parse = (data) => {
  const games = [];
  for (let i= 0; i < data.length; i++) {
    const game = data[i][0]
    games.push({
      publisherId: game.publisher_id,
      name: game.name,
      platform: game.os,
      storeId: game.app_id, // not sure on this one
      bundleId: game.bundle_id,
      appVersion: game.version,
      isPublished: true, // we can assume top 100 games are published
    })
  }

  return games;
}

module.exports.populateAll = async () => {

  try {
    const android = await fetch(ANDROID_TOP_100)
    const ios = await fetch(IOS_TOP_100)

    // blocking, a promise.all could be slighlty better

    const games = []
    if (android.ok) {
      const data = await android.json()
      games.push(...parse(data))
    }

    if (ios.ok) {
      const data = await ios.json()
      games.push(...parse(data))
    }

    if (games.length) {
      await db.Game.bulkCreate(games)
      return games.length
    }
    
  } catch (error) {
      throw Error(error)
  }
}

