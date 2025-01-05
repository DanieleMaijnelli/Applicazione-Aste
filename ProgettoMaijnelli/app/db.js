const { MongoClient } = require('mongodb');
const URI = "mongodb://mongo:27017";
let cachedDB;

module.exports = {
    connect2db: async () => {
        if (cachedDB) {
            console.log("Recupero connessione esistente");
            return cachedDB;
        }
        try {
            console.log("Connessione in corso...");
            const client = await MongoClient.connect(URI);
            console.log("Connessione creata!");
            cachedDB = client.db("DB_MaijnelliWebApplication");
            await initializeDatabase();
            return cachedDB;
        } catch (err) {
            console.log("Errore!");
            return null;
        }
    }
}

async function initializeDatabase() {
    try {
        const usersCollection = cachedDB.collection('users');
        const bidsCollection = cachedDB.collection('bids');
        const auctionsCollection = cachedDB.collection('auctions');

        if (await usersCollection.countDocuments() > 0) {
            return;
        }

        if (await bidsCollection.countDocuments() > 0) {
            return;
        }

        if (await auctionsCollection.countDocuments() > 0) {
            return;
        }

        console.log("Inizializzazione del database...");

        await usersCollection.insertMany([
            { id: 1, username: "CoolHat", name: "John", surname: "Doe", password: "password" },
            { id: 2, username: "RichGuy", name: "Jane", surname: "Smith", password: "Segreto!" },
            { id: 3, username: "AJ", name: "Alice", surname: "Johnson", password: "TopSecret" },
            { id: 4, username: "BlueSky", name: "Bob", surname: "Brown", password: "NotToday" },
            { id: 5, username: "Duckduck", name: "Charlie", surname: "Davis", password: "Eheheh" },
            { id: 6, username: "NoisyPig98", name: "Diana", surname: "Miller", password: "12345" },
            { id: 7, username: "username", name: "Eve", surname: "Wilson", password: "pss" },
            { id: 8, username: "DarkBuyer", name: "Frank", surname: "Moore", password: "test" },
            { id: 9, username: "gtaylor", name: "Grace", surname: "Taylor", password: "54321" },
            { id: 10, username: "hankanderson", name: "Hank", surname: "Anderson", password: "puff" }
        ]);

        await auctionsCollection.insertMany([
            {
                id: 1,
                title: "Vaso antico",
                description: "Un pregiato vaso antico risalente al 1927.",
                endDate: new Date("2025-01-05T12:59Z"),
                startingBid: 50,
                currentBid: 100,
                winner: "username",
                owner: "CoolHat",
            },
            {
                id: 2,
                title: "Dipinto rinascimentale",
                description: "Un magnifico dipinto del periodo rinascimentale, attribuito a un artista sconosciuto.",
                endDate: new Date("2025-02-10T23:59Z"),
                startingBid: 200,
                currentBid: null,
                winner: null,
                owner: "DarkBuyer",
            },
            {
                id: 3,
                title: "Moneta romana",
                description: "Una rara moneta romana in ottime condizioni, risalente al 50 a.C.",
                endDate: new Date("2025-01-15T23:59Z"),
                startingBid: 100,
                currentBid: 150,
                winner: "NoisyPig98",
                owner: "BlueSky",
            },
            {
                id: 4,
                title: "Scultura moderna",
                description: "Una scultura moderna in bronzo, realizzata da un artista contemporaneo.",
                endDate: new Date("2025-01-02T23:59Z"),
                startingBid: 300,
                currentBid: 300,
                winner: "BlueSky",
                owner: "CoolHat",
            },
            {
                id: 5,
                title: "Orologio da tasca",
                description: "Un elegante orologio da tasca in argento, fabbricato nel 1890.",
                endDate: new Date("2025-01-12T23:59Z"),
                startingBid: 150,
                currentBid: null,
                winner: null,
                owner: "gtaylor",
            }
        ])

        await bidsCollection.insertMany([
            { id: 1, auction: "Scultura moderna", user: "BlueSky", date: "2025-01-01T23:23Z", value: "300" },
            { id: 2, auction: "Moneta romana", user: "NoisyPig98", date: "2025-01-05T20:19Z", value: "150" },
            { id: 3, auction: "Vaso antico", user: "username", date: "2025-01-02T21:23Z", value: "100" },
            { id: 4, auction: "Moneta romana", user: "NoisyPig98", date: "2025-01-05T14:10Z", value: "100" },
            { id: 5, auction: "Moneta romana", user: "gtaylor", date: "2025-01-05T15:16Z", value: "125" },
            { id: 6, auction: "Vaso antico", user: "NoisyPig98", date: "2025-01-01T16:53Z", value: "50" },
            { id: 7, auction: "Vaso antico", user: "BlueSky", date: "2025-01-01T19:43Z", value: "70" }
        ]);

        console.log("Inizializzazione del database completata!");

    } catch (error) {
        console.error("Errore nell'inizializzazione del database:", error);
    }
}