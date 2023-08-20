const socket = io()

const fetchData = (url, callback)=>{
    fetch(url)
    .then(res => {
        if(!res.ok)
            throw Error('something went wrong')
        // response.json(data): send json response to client
        // result.json(): reads the request body and returns it as a promise that resolves with the result of parsing the body text as JSON.
        return res.json();
    })
    .then(callback)
    .catch(err => console.log(err.message))
}

socket.on('error', message=>{
    window.location.href = 'http://localhost:7000/games?error=' + message
})