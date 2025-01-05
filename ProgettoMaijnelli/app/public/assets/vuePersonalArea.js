const app = Vue.createApp({
    data() {
        return {
            isAuthenticated: false, 
            isSignin: true, 
            user: null, 
            form: {
                username: '',
                password: '',
                name: '',
                surname: '',
            },
            errorMessage: null,
            successMessage: null,
        };
    },
    methods: {
        async checkAuthentication() {
            try {
                const response = await fetch('http://localhost:3000/api/whoami');
                if (response.ok) {
                    this.user = await response.json();
                    this.isAuthenticated = true;
                } else {
                    this.isAuthenticated = false;
                    this.user = null;
                }
            } catch (error) {
                console.error('Errore durante il controllo dello stato di autenticazione:', error);
            }
        },
        async handleSignin() {
            try {
                this.errorMessage = null;
                this.successMessage = null;
                const response = await fetch('http://localhost:3000/api/auth/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.form.username,
                        password: this.form.password,
                    }),
                });
                if (response.ok) {
                    await this.checkAuthentication();
                } else {
                    const parsedResponse = await response.json();
                    this.errorMessage = parsedResponse.error;
                }
            } catch (error) {
                this.errorMessage = 'Errore durante l\'accesso.';
            }
        },
        async handleSignup() {
            try {
                this.errorMessage = null;
                this.successMessage = null;
                const response = await fetch('http://localhost:3000/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form),
                });
                if (response.ok) {
                    this.successMessage = 'Registrazione completata con successo.';
                    this.isSignin = true;
                } else {
                    const parsedResponse = await response.json();
                    this.errorMessage = parsedResponse.error;
                }
            } catch (error) {
                this.errorMessage = 'Errore durante la registrazione.';
            }
        },
        toggleAuthForm() {
            this.isSignin = !this.isSignin;
        },
    },
    mounted() {
        this.checkAuthentication();
    },
});

app.mount('#authentication-app');
