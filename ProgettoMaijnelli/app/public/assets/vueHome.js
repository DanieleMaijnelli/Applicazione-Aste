const app = Vue.createApp({
    data() {
        return {
            sections: [
                {
                    title: "Aste Esclusive",
                    description: "Scopri oggetti rari e di valore, disponibili per un tempo limitato.",
                    details: "Entusiasta è dove l'eccellenza incontra l'unicità. Qui, offriamo un'esperienza di asta senza pari, riservata ai più appassionati e sofisticati, pronti a tutto pur di aggiudicarsi un affare quando ne vedono uno. Nel nostro sito troverai una collezione di oggetti straordinari, in cui ogni pezzo è unico e di altissimo valore. Preparati a scontri di offerte senza esclusione di colpi, solo il più tenace riuscirà ad aggiudicarsi gli oggetti più preziosi!",
                    expanded: false,
                },
                {
                    title: "Unisciti alla Community",
                    description: "Registrati per mettere all'asta i tuoi oggetti o fare offerte.",
                    details: "La community di Entusiasta è il cuore pulsante della nostra piattaforma. Qui, collezionisti, appassionati e curiosi si incontrano per condividere la loro passione per le aste e gli oggetti unici. Ogni membro della nostra community porta con sé una storia, un'esperienza e una conoscenza che arricchiscono l'intera piattaforma. La bellezza della nostra community risiede nella sua diversità: persone di ogni età e provenienza si uniscono con un unico obiettivo, aggiudicarsi l'asta migliore! Partecipare alla community di Entusiasta significa entrare a far parte di una rete di persone che condividono la stessa passione per l'eccellenza e la rarità.",
                    expanded: false,
                },
                {
                    title: "Perché Sceglierci?",
                    description: "Affidabilità, sicurezza e facilità d'uso per tutti i nostri utenti.",
                    details: "Offriamo un'esperienza sicura e affidabile, ogni utente è trattato come un membro della nostra famiglia. La nostra piattaforma è intuitiva e facile da usare, rendendo l'esperienza di fare offerte semplice e piacevole. Offriamo strumenti per monitorare le aste, fare offerte in tempo reale e rimanere sempre aggiornati sulle ultime novità. Inoltre permettiamo di controllare direttamente chi sono i nostri utenti, scopri chi sono i migliori esperti d'aste, o diventa uno di loro!",
                    expanded: false,
                },
            ]
        };
    },
    methods: {
        toggleSection(index) {
            this.sections[index].expanded = !this.sections[index].expanded;
        }
    }
});

app.mount('#app');