const express = require('express');
const session = require('express-session');
const db = require('../db');
const router = express.Router();

function authenticateSession(req, res, next) {
    if (!req.session.user) {
        return res.status(403).json({ error: "Per effettuare l' operazione desiderata è necessario autenticarsi" });
    }
    next();
}

router.authenticateSession = authenticateSession;

router.post('/signup', async (req, res) => {
    const { username, name, surname, password } = req.body;
    const mongo = await db.connect2db();
    const user = await mongo.collection("users").findOne({ username });
    if (user) {
        return res.status(409).json({ error: "Username già esistente" });
    }
    if (name.length < 3) {
        return res.status(400).json({ error: "Il nome deve avere almeno 3 caratteri" });
    }
    if (surname.length < 3) {
        return res.status(400).json({ error: "Il cognome deve avere almeno 3 caratteri" });
    }
    if (username.length < 2) {
        return res.status(400).json({ error: "Lo username deve avere almeno 2 caratteri" });
    }
    if (password.length < 5) {
        return res.status(400).json({ error: "La password deve avere almeno 5 caratteri" });
    }
    const highestIdUser = await mongo.collection("users").findOne({}, { sort: { id: -1 } });
    const id = highestIdUser ? highestIdUser.id + 1 : 1;
    const newUser = { id, username, password, name, surname };
    await mongo.collection("users").insertOne(newUser);
    res.status(200).json({ message : "Registrazione completata con successo" });
});

router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const mongo = await db.connect2db();
    const user = await mongo.collection("users").findOne({ username});
    if (user) {
        if (username === user.username && password === user.password) {
            req.session.user = username;
            res.status(200).json({ message : "Autenticazione completata con successo" });
        } else {
            res.status(400).json({ error: "Password errata" });
        }
    } else {
        res.status(404).json({ error: "Username inesistente" });
    }
});

module.exports = router;