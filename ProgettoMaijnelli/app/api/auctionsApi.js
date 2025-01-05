const express = require('express');
const session = require('express-session');
const db = require('../db');
const auth = require('./auth');
const e = require('express');
const router = express.Router();

router.get('', async (req, res) => {
    const mongo = await db.connect2db();
    const query = req.query.q ? req.query.q : "";
    const filter = {
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    };
    const auctions = await mongo.collection("auctions").find(filter).toArray();
    auctions.forEach(auction => {
        delete auction._id;
    });
    res.status(200).json(auctions);
});

router.post('', auth.authenticateSession, async (req, res) => {
    const { title, description, endDate, startingBid } = req.body;
    if (title.length < 3) {
        return res.status(400).json({ error: "Il titolo deve avere almeno 3 caratteri" });
    }
    if (startingBid < 5) {
        return res.status(400).json({ error: "L'offerta minima deve essere di 5 euro" });
    }
    const parsedEndDate = new Date(endDate);
    let currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1);
    if (parsedEndDate < currentDate) {
        return res.status(400).json({ error: "La data di fine asta non può precedere la data attuale" });
    }
    const mongo = await db.connect2db();
    if (await mongo.collection("auctions").findOne({ title })) {
        return res.status(400).json({ error: "Esiste già un'asta con lo stesso titolo" });
    }
    const highestIdAuction = await mongo.collection("auctions").findOne({}, { sort: { id: -1 } });
    const id = highestIdAuction ? highestIdAuction.id + 1 : 1;
    const owner = req.session.user;
    const auction = { id, title, description, endDate, startingBid, currentBid: null, winner: null, owner };
    await mongo.collection("auctions").insertOne(auction);
    res.status(201).json(auction);
});

router.get('/:id', async (req, res) => {
    const mongo = await db.connect2db();
    const auction = await mongo.collection("auctions").findOne({ id: parseInt(req.params.id) });
    if (auction) {
        delete auction._id;
        res.status(200).json(auction);
    } else {
        res.status(404).json({ error: "L'asta richiesta non esiste" });
    }
});

router.put('/:id', auth.authenticateSession, async (req, res) => {
    const mongo = await db.connect2db();
    const filter = { id: parseInt(req.params.id) };
    const auction = await mongo.collection("auctions").findOne(filter);
    if (auction) {
        if (req.session.user === auction.owner) {
            const { title, description } = req.body;
            if (title.length < 3) {
                return res.status(400).json({ error: "Il titolo deve avere almeno 3 caratteri" });
            }
            const auctionEndDate = new Date(auction.endDate);
            let currentDate = new Date();
            currentDate.setHours(currentDate.getHours() + 1);
            if (auctionEndDate < currentDate) {
                return res.status(400).json({ error: "Le aste già aggiudicate non possono essere modificate" });
            }
            if (await mongo.collection("auctions").findOne({ title })) {
                return res.status(400).json({ error: "Esiste già un'asta con lo stesso titolo" });
            }
            await mongo.collection("auctions").updateOne(filter, { $set: { title, description } });
            updatedAuction = await mongo.collection("auctions").findOne(filter);
            res.status(200).json(updatedAuction);
        } else {
            res.status(401).json({ error: "Solo il proprietario dell'asta può modificarla" });
        }
    } else {
        res.status(404).json({ error: "L'asta richiesta non esiste" });
    }
});

router.delete('/:id', auth.authenticateSession, async (req, res) => {
    const mongo = await db.connect2db();
    const filter = { id: parseInt(req.params.id) };
    const deletedAuction = await mongo.collection("auctions").findOne(filter);
    if (deletedAuction) {
        if (req.session.user === deletedAuction.owner) {
            let currentDate = new Date();
            currentDate.setHours(currentDate.getHours() + 1);
            const deletedAuctionEndDate = new Date(deletedAuction.endDate);
            if (deletedAuctionEndDate > currentDate) {
                await mongo.collection("auctions").deleteOne(filter);
                res.status(200).json(deletedAuction);
            } else {
                res.status(400).json({ error: "Le aste già aggiudicate non possono essere eliminate" });
            }
        } else {
            res.status(401).json({ error: "Solo il proprietario dell'asta può eliminarla" });
        }
    } else {
        res.status(404).json({ error: "L'asta richiesta non esiste" });
    }
});

router.get('/:id/bids', async (req, res) => {
    const mongo = await db.connect2db();
    const auction = await mongo.collection("auctions").findOne({ id: parseInt(req.params.id) });
    if (auction) {
        const bids = await mongo.collection("bids").find({ auction: auction.title }).toArray();
        bids.forEach(bid => {
            delete bid._id;
        });
        res.status(200).json({ bids });
    } else {
        res.status(404).json({ error: "L'asta indicata non esiste" });
    }
});

router.post('/:id/bids', auth.authenticateSession, async (req, res) => {
    const mongo = await db.connect2db();
    const { value } = req.body;
    const parsedValue = parseInt(value);

    if (isNaN(parsedValue) || parsedValue <= 0) {
        return res.status(400).json({ error: "Il valore dell'offerta deve essere un numero valido maggiore di zero." });
    }

    const auction = await mongo.collection("auctions").findOne({ id: parseInt(req.params.id) });
    if (auction) {
        const user = req.session.user;

        if (user === auction.owner) {
            return res.status(400).json({ error: "Il proprietario di un'asta non può fare offerte per la propria asta" });
        }

        const currentDate = new Date();
        let correctedCurrentDate = (new Date()).setHours(currentDate.getHours() + 1);
        const auctionEndDate = new Date(auction.endDate);

        if (auctionEndDate < correctedCurrentDate) {
            return res.status(400).json({ error: "Non si possono fare offerte per aste già aggiudicate" });
        }

        const highestBid = await mongo.collection("bids").findOne({ auction: auction.title }, { sort: { value: -1 } });

        if (highestBid && parsedValue < (parseInt(highestBid.value) + 5)) {
            return res.status(400).json({ error: "L'offerta deve essere superiore all'offerta corrente di almeno 5 euro" });
        }

        if (parsedValue < auction.startingBid) {
            return res.status(400).json({ error: "L'offerta deve essere maggiore o uguale all'offerta minima" });
        }

        const highestIdBid = await mongo.collection("bids").findOne({}, { sort: { id: -1 } });

        const id = highestIdBid ? highestIdBid.id + 1 : 1;
        const bid = { id, auction: auction.title, user, date: currentDate, value: parsedValue };

        await mongo.collection("auctions").updateOne(
            { id: auction.id },
            { $set: { winner: user } }
        );

        await mongo.collection("bids").insertOne(bid);

        res.status(201).json(bid);
    } else {
        return res.status(404).json({ error: `L'asta con ID ${req.params.id} non esiste.` });
    }
});



module.exports = router;