const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const { populateAll } = require('./utils/populate');

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

app.get('/api/games', async (req, res) => {
  try {
    const games = await db.Game.findAll()
    return res.send(games)
  } catch (err) {
    console.error('There was an error querying games', err);
    return res.send(err);
  }
})

app.post('/api/games', async (req, res) => {
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  try {
    const game = await db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    return res.send(game)
  } catch (err) {
    console.error('***There was an error creating a game', err);
    return res.status(400).send(err);
  }
})

app.post('/api/games/search', async (req, res) => {
  try {

    const where = {}

    if (req.body.name) {
      where.name = db.sequelize.where(
        db.sequelize.fn('LOWER', db.sequelize.col('name')), 'LIKE', '%' + req.body.name.toLowerCase() + '%'
      )
    }

    /*
      Readme ask to return everything when no search is specified. IMO, platform is always specified so we should use it as a filter when we can.
    */
    // we could test here that platform in an accepted value ios / android
    if (req.body.platform) {
      where.platform = req.body.platform
    }

    let games = await db.Game.findAll({ where })

    return res.send(games)
  } catch (err) {
    return res.send(err);
  }
})

app.post('/api/games/populate', async (req, res) => {
  try {
    // on success, we could re-trigger a findAll and send the data to the front so the user doesn't have to refresh the page to see it.
    const populate = await populateAll()
    return res.send({populate})
  } catch (err) {
    return res.send(err);
  }
})

app.delete('/api/games/:id', async (req, res) => {
  try {
    const game = await db.Game.findByPk(parseInt(req.params.id))
    await game.destroy({ force: true })
    return res.send({ id: game.id  })
  } catch (err) {
    console.error('***Error deleting game', err);
    return res.status(400).send(err);
  }
});

app.put('/api/games/:id', async (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  try {
    const game = await db.Game.findByPk(id)
    await game.update({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    return res.send(game)
  } catch (err) {
    console.error('***Error updating game', err);
    return res.status(400).send(err);
  }
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
