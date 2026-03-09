// node script to test apiFetch
const token = ""; // We might need to login, or we can just send an anonymous request to a protected endpoint 
// and see if we get 401 Unathorized or "Failed to fetch" (connection refused)
const http = require('http');

http.get('http://localhost:5000/api/doctors', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => { console.log("OK", data.substring(0, 100)); });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
