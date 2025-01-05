const express = require('express');
const session = require('express-session');
const db = require('../db');
const auctionsApi = require('./auctionsApi');
const auth = require('./auth');
const router = express.Router();

router.use('/auth', auth);
router.use('/auctions', auctionsApi);

router.get('/users', async (req, res) => {
    const mongo = await db.connect2db();
    const query = req.query.q ? req.query.q : "";
    const filter = {
        $or: [
            { username: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
            { surname: { $regex: query, $options: 'i' } }
        ]
    };
    const users = await mongo.collection("users").find(filter).toArray();
    users.forEach(user => {
        delete user._id;
        delete user.password;
    });
    res.status(200).json(users);
});

router.get('/users/:id', async (req, res) => {
    const mongo = await db.connect2db();
    const user = await mongo.collection("users").findOne({ id: parseInt(req.params.id) });
    if (user) {
        const { id, username, name, surname } = user;
        res.status(200).json({ id, username, name, surname});
    } else {
        res.status(404).json({ error: "L'utente richiesto non esiste" });
    }
});

router.get('/bids/:id', async (req, res) => {
    const mongo = await db.connect2db();
    const bid = await mongo.collection("bids").findOne({ id: parseInt(req.params.id) });
    if (bid) {
        delete bid._id;
        res.status(200).json(bid);
    } else {
        res.status(404).json({ error: "L'offerta ricercata non esiste" });
    }
});

router.get('/whoami', auth.authenticateSession, async (req, res) => {
    const mongo = await db.connect2db();
    const user = await mongo.collection("users").findOne({ username: req.session.user });
    const { id, username, name, surname } = user;
    res.status(200).json({id, username, name, surname });
});

module.exports = router;