// using native fetch

async function testLogin() {
    const url = 'http://localhost:5000/api/auth/login';
    const credentials = {
        email: 'prajith@nanosoup.com',
        password: 'ppp'
    };

    console.log(`Attempting login at ${url} with`, credentials);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        console.log('Status Code:', response.status);
        if (response.ok) {
            console.log('Login Successful!');
            console.log('Token received:', !!data.token);
            console.log('User Role:', data.user ? data.user.role : 'N/A');
        } else {
            console.log('Login Failed:', data.message);
        }
    } catch (error) {
        console.error('Network/Server Error:', error.message);
    }
}

// Check if we need to install node-fetch or if we can use native global fetch
if (!globalThis.fetch) {
    console.log("Native fetch not found, check node version or install node-fetch");
} else {
    testLogin();
}
