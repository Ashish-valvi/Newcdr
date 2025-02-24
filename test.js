fetch("http://localhost:5000/protected", {
    method: "GET",
    headers: {
        "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2JhZTMyMDk2YjA1YmMzODAyMWYxNjEiLCJpYXQiOjE3NDAzMDIzODcsImV4cCI6MTc0MDMwNTk4N30.YxuwVHFqJk40FarqgPFS4JovZGIkx9YH8sBIr3bERMs"
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
