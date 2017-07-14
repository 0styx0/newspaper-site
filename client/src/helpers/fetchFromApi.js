
function fetchFromApi(url, method = "get", body = {}) {

    const options = {
        credentials: "include",
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }

    if (method.toLowerCase() === "get") {
        delete options.body;
    }

    return fetch(`http://localhost:3000/api/${url}`, options);
}

export default fetchFromApi;