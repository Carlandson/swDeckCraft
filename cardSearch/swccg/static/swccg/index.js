document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#deckSearch').addEventListener('click', () => searchDecks(event))
});

//const api_url = "https://scomp.starwarsccg.org/Light.json";
async function sets() {
    await fetch("https://scomp.starwarsccg.org/Light.json", {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    },
    "referrer": "https://scomp.starwarsccg.org/",
    "method": "GET",
    "mode": "cors"
    });
}
console.log(sets);
async function fourLom() {
    await fetch("https://res.starwarsccg.org/cards/EnhancedCloudCity-Dark/large/4lomwithconcussionrifle.gif", {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0",
        "Accept": "image/avif,image/webp,*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "same-site"
    },
    "referrer": "https://scomp.starwarsccg.org/",
    "method": "GET",
    "mode": "cors"
    });
}
fourLom();
console.log(fourLom)
// async function getapi(url) {
//     const response = await fetch(url);

//     var data = await response.json();
//     console.log(data);
//     if (response) {
//         hideloader();
//     }
//    // show(data);
// }
// getapi(api_url);

// function hideLoader() {
//     document.getElementById('loading').style.display = 'none';
// };
// function show(data) {
//     let tab = `
//         <tr
//         <th>Name</th>
//         `;
//     for(let d in data.list) {
//         tab += `
//         `
//     }

function searchDecks(event) {
    console.log('test')
    event.preventDefault()
    let parameter = document.getElementById('searchChoice').value;
    let divChange = document.getElementById('results');
    divChange.innerHTML = "";
    let count = 0;
    fetch('index_search' + "/" + parameter)
        .then(response => response.json())
        .then(results => {
            results.forEach(deck => {
                let resultDeck = document.createElement('div');
                let id = deck['id']
                resultDeck.innerHTML = `<a href="/deckview/${id}" style="cursor:pointer" class="mb-1 focus:ring">${deck['name']} by ${deck['author']} - <i>${deck['side']} side</i></a>`
                let name = deck['name'];
                let type = deck['type']
                //resultCard.addEventListener('click', () => addCard(name, type));
                divChange.appendChild(resultDeck);
                count++;
            });
            resultCount.innerHTML = `<span class="text-sm">${count} Result(s)<br></span>`;
        });
}
