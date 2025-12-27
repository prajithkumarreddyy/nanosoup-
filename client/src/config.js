let API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

if (API_URL && !API_URL.startsWith('http')) {
    API_URL = `https://${API_URL}`;
}
export default API_URL;
