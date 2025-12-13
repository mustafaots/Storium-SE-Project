// test_routines.js
// We are skipping the browser so we don't get CORS errors

async function testMyCode() {
    const response = await fetch('http://localhost:3001/api/routines/1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: 101,
            quantity: 50
        })
    });

    const data = await response.json();
    console.log("=========================================");
    console.log("STATUS:", response.status);
    console.log("SERVER RESPONSE:", JSON.stringify(data, null, 2));
    console.log("=========================================");
}

testMyCode();