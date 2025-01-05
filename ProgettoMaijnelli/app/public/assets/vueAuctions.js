const app = Vue.createApp({
    data() {
        return {
            searchQuery: '',
            bidSearchQuery: '',
            searchedBid: null,
            auctions: [],
            newAuction: {
                title: '',
                description: '',
                endDate: '',
                startingBid: 0,
            },
            editAuction: {
                id: null,
                title: '',
                description: '',
            },
            newBidValue: '',
            errorMessage: null,
            successMessage: null,
        };
    },
    methods: {
        async searchAuctions() {
            try {
                this.errorMessage = null;
                this.successMessage = null;
                let response;
                if (this.searchQuery.trim() === '') {
                    response = await fetch(`http://localhost:3000/api/auctions`);
                } else if (!isNaN(this.searchQuery)) {
                    response = await fetch(`http://localhost:3000/api/auctions/${this.searchQuery}`);
                } else {
                    response = await fetch(`http://localhost:3000/api/auctions?q=${this.searchQuery}`);
                }
                if (response.ok) {
                    this.auctions = await response.json();
                    this.auctions = Array.isArray(this.auctions) ? this.auctions : [this.auctions];
                    this.auctions.forEach(auction => {
                        auction.showBids = false;
                        auction.bids = [];
                    });
                    if (this.auctions.length === 0) {
                        this.errorMessage = 'Nessuna asta corrisponde ai parametri di ricerca.';
                    }
                } else {
                    this.auctions = [];
                    this.errorMessage = 'Nessuna asta corrisponde ai parametri di ricerca.';
                }
            } catch (error) {
                this.errorMessage = 'Errore durante la ricerca delle aste.';
                console.error(error);
            }
        },
        async viewAuctionDetails(auctionId) {
            try {
                const response = await fetch(`http://localhost:3000/api/auctions/${auctionId}/bids`);
                if (response.ok) {
                    const { bids } = await response.json();
                    const auction = this.auctions.find(a => a.id === auctionId);
                    if (auction) {
                        auction.bids = bids;
                        auction.showBids = !auction.showBids;
                    }
                } else {
                    this.errorMessage = 'Errore durante il recupero delle offerte.';
                }
            } catch (error) {
                this.errorMessage = 'Errore durante il recupero delle offerte.';
                console.error(error);
            }
        },
        async createAuction() {
            try {
                this.errorMessage = null;
                this.successMessage = null;
                const response = await fetch('http://localhost:3000/api/auctions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newAuction),
                });
                if (response.ok) {
                    const auction = await response.json();
                    this.auctions.push(auction);
                    this.newAuction = { title: '', description: '', endDate: '', startingBid: 0 };
                    this.successMessage = 'Asta creata correttamente.';
                } else {
                    const errorData = await response.json();
                    this.errorMessage = errorData.error || 'Errore durante la creazione dell\'asta.';
                }
            } catch (error) {
                this.errorMessage = 'Errore durante la creazione dell\'asta.';
                console.error(error);
            } finally {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        async deleteAuction(auctionId) {
            this.errorMessage = null;
            this.successMessage = null;
            try {
                const response = await fetch(`http://localhost:3000/api/auctions/${auctionId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    this.auctions = this.auctions.filter(auction => auction.id !== auctionId);
                    this.successMessage = 'Asta eliminata correttamente.';
                } else {
                    const errorData = await response.json();
                    this.errorMessage = errorData.error || 'Errore durante la cancellazione dell\'asta.';
                }
            } catch (error) {
                this.errorMessage = 'Errore durante la cancellazione dell\'asta.';
                console.error(error);
            } finally {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        async placeBid(auctionId) {
            this.errorMessage = null;
            this.successMessage = null;

            const bidValue = parseInt(this.newBidValue);

            try {
                const response = await fetch(`http://localhost:3000/api/auctions/${auctionId}/bids`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: bidValue }),
                });

                if (response.ok) {
                    const bid = await response.json();
                    const auction = this.auctions.find(a => a.id === auctionId);
                    if (auction) {
                        auction.bids.push(bid);
                    }
                    this.newBidValue = '';
                    this.successMessage = 'Offerta inviata correttamente.';
                } else {
                    const errorData = await response.json();
                    this.errorMessage = errorData.error || 'Errore durante l\'invio dell\'offerta.';
                }
            } catch (error) {
                this.errorMessage = 'Errore durante l\'invio dell\'offerta.';
                console.error(error);
            } finally {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        async editAuctionDetails() {
            this.errorMessage = null;
            this.successMessage = null;
            try {
                const response = await fetch(`http://localhost:3000/api/auctions/${this.editAuction.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: this.editAuction.title,
                        description: this.editAuction.description,
                    }),
                });
                if (response.ok) {
                    const updatedAuction = await response.json();
                    const index = this.auctions.findIndex(a => a.id === updatedAuction.id);
                    if (index !== -1) {
                        this.auctions[index] = updatedAuction;
                        this.successMessage = 'Asta modificata correttamente.';
                    }
                    this.editAuction = { id: null, title: '', description: '' };
                } else {
                    const errorData = await response.json();
                    this.errorMessage = errorData.error || 'Errore durante la modifica dell\'asta.';
                }
            } catch (error) {
                this.errorMessage = 'Errore durante la modifica dell\'asta.';
                console.error(error);
            } finally {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        prepareEditAuction(auction) {
            this.editAuction = { id: auction.id, title: auction.title, description: auction.description };
            setTimeout(() => {
                document.getElementById('modifyAuction').scrollIntoView({ behavior: 'smooth' });
            }, 750);
        },
        async searchBid() {
            try {
                this.errorMessage = null;
                this.successMessage = null;
                this.searchedBid = null;
                console.log("Funzione chiamata");
                const response = await fetch(`http://localhost:3000/api/bids/${this.bidSearchQuery}`);
                if (response.ok) {
                    this.searchedBid = await response.json();
                } else {
                    const errorData = await response.json();
                    this.errorMessage = errorData.error || 'Errore durante la ricerca dell\'offerta.';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (error) {
                this.errorMessage = 'Errore durante la ricerca dell\'offerta.';
                console.error(error);
            }
        },
    },
    mounted() {
        this.searchAuctions();
    },
});

app.mount('.form-section');
