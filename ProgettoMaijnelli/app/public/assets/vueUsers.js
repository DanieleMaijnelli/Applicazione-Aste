const app = Vue.createApp({
    data() {
        return {
            searchQuery: '',
            users: [],
        };
    },
    methods: {
        async searchUsers() {
            try {
                let response;
                if (this.searchQuery.trim() === '') {
                    response = await fetch(`http://localhost:3000/api/users`);
                } else if (!isNaN(this.searchQuery)) {
                    response = await fetch(`http://localhost:3000/api/users/${this.searchQuery}`);
                } else {
                    response = await fetch(`http://localhost:3000/api/users?q=${this.searchQuery}`);
                }

                if (response.ok) {
                    const parsedResponse = await response.json();
                    this.users = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
                    await this.fetchWonAuctions();
                } else {
                    this.users = [];
                }
            } catch (error) {
                console.error('Errore durante la ricerca degli utenti:', error);
                this.users = [];
            }
        },
        async fetchWonAuctions() {
            try {
                const response = await fetch('http://localhost:3000/api/auctions');
                if (response.ok) {
                    const auctions = await response.json();

                    let currentDate = new Date();
                    currentDate.setHours(currentDate.getHours() + 1);
                    this.users.forEach(user => {
                        user.wonAuctions = auctions.filter(auction => auction.winner === user.username);
                        user.wonAuctions = user.wonAuctions.filter(auction => new Date(auction.endDate) < currentDate);
                        user.showAuctions = false;
                    });
                } else {
                    console.error('Errore durante il recupero delle aste.');
                }
            } catch (error) {
                console.error('Errore durante la richiesta delle aste:', error);
            }
        },
        toggleAuctions(userId) {
            const user = this.users.find(user => user.id === userId);
            if (user) {
                user.showAuctions = !user.showAuctions;
            }
        },
    },
    mounted() {
        this.searchUsers();
    },
});

app.mount('.form-section');
