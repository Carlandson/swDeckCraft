document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#deckSubmit').addEventListener('submit', () => buildDeck());
    document.querySelector('#side').addEventListener('change', () => searchCards(event));
    document.querySelector('#filter').addEventListener('click', () => addFilter());
});
function addFilter() {
    let div = document.querySelector('.searchBars');
    let searchDiv = document.createElement('li');
    searchDiv.setAttribute('style', 'border: 1px solid black; width: 290px; margin: 2px');
    let newSearchBar = document.createElement('input');
    newSearchBar.setAttribute('id', 'searchQuery');
    let searchOptions = document.createElement('select');
    searchOptions.setAttribute("id", "searchOption");
    searchOptions.innerHTML = `
        <option>Name</option>
        <option>Lore</option>
        <option>Gametext</option>
        <option>type</option>
        `;
    newSearchBar.addEventListener('oninput', () => filterResults(input));
    searchDiv.append(newSearchBar);
    searchDiv.append(searchOptions);
    div.append(searchDiv);
}

function filterResults(input) {
    var cards = document.querySelectorAll('.cards');
    cards.forEach()
    // hide elements that do not have search query

}

function searchCards(event) {
    event.preventDefault()
    let cardSide = document.querySelector('#side').value;
    let resultDiv = document.querySelector('#searchResults');
    let count = 0;
    resultDiv.innerHTML = "";
    fetch ('/card_search/' + cardSide)
        .then(response => response.json())
        .then(results => {
            results.forEach(card => {
                let resultCard = document.createElement('div');
                resultCard.setAttribute('id', card['name'])
                resultCard.setAttribute('class', 'card')
                resultCard.innerHTML = `<img src=${card['image']} class="cardImage">`
                let name = card['name'];
                let type = card['type']
                resultCard.addEventListener('click', () => addCard(name, type));
                resultDiv.append(resultCard);
                count++;
            });
            resultCount.innerHTML = `${count} Results`;
        });

}

function addCard(name, cardType) {
    let deckArea = document.querySelector("#cards_added");
    let addCard = document.createElement('div');
    addCard.innerHTML = `<li id="${name}"> ${name} - ${cardType}</li>`
    deckArea.appendChild(addCard);
    deckTotal();
    addCard.addEventListener('click', () => deleteCard(name));
}

function deckTotal() {
    var totalList = document.getElementById('cards_added').getElementsByTagName("li");
    var total = totalList.length;
    let deckCount = document.querySelector('#deckCount');
    deckCount.innerHTML = `${total}`;
    if(total == 60) {
        document.querySelector('#buttonSubmit').disabled = false;
    }
    else{document.querySelector('#buttonSubmit').disabled = true;}
}

function deleteCard(name){
    document.getElementById(name).remove();
    deckTotal();
}

function buildDeck(event) {
    event.preventDefault()
    var deckName = document.getElementById('deckName').value;
    fetch('deck_check' + "/" + deckName, {method:'get'})
        .then(response=>response.json())
        .then((data)=> {
            console.log(data)
            if(data == true) {
                alert("deck exists");
            }
            else {
                var cards = document.getElementById('cards_added').getElementsByTagName("li");
                let deck = []
                for (let i=0; i< cards.length; i++){
                    let temp = cards[i].id;
                    deck.push(temp)
                };
                fetch('deck_build', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: document.querySelector('#deckName').value,
                        author: document.querySelector('#author').value,
                        cards: deck,
                        side: document.querySelector('#side').value,
                    })
                });
                alert('deck posted!');
                window.location.href = "http://127.0.0.1:8000";
            };
    });
}
