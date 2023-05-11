// card dictionaries
const lightDictionary = [];
const darkDictionary = [];
var tempDictionary = [];
var tempArray = [];
var count = 0;
var deckOnDeck = [];
//card object
class cardObject {
    constructor(
        name,
        gametext,
        lore,
        image,
        type,
        side,
        subType,
        gempId,
    ) {
    this.name = name;
    this.gametext = gametext;
    this.lore = lore;
    this.image = image;
    this.type = type;
    this.side = side;
    this.subType = subType;
    this.gempId = gempId;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadCards();
    document.querySelector('#deckSubmit').addEventListener('submit', () => buildDeck());
    document.querySelector('#side').addEventListener('change', () => searchCards());
    document.querySelector('#optionOne').addEventListener('change', () => changeFilter());
    document.querySelector('#textSearchOne').addEventListener('input', () => textFilter(document.querySelector('#searchOneType').value, document.querySelector("#textSearchOne").value));
    document.querySelector('#side').value = "choose";
    document.querySelector('#resultCount').innerHTML = count;
    let bars = document.querySelectorAll('.searchBar');
    bars.forEach(bar => {
        bar.value = "";
    });
    //dynamic array listening for changes in search results for dynamic pagination
    // const targetNode = document.querySelector('#searchResults'); 
    // const config = { attributes: true, childList: true, subtree:true };
    // const callback = (mutationList, observer) => {
    //     console.log("the mutationList object is " + mutationList);
    //     for (i=0; i < mutationList.length; i++) {
    //         console.log(mutationList[i].addedNodes.length)
    //         if (mutationList[i].type === "childList"){
    //             for (j=0; j<mutationList[i].addedNodes.length; j++){
    //                 testArray.push(mutationList[i].addedNodes[j].id)
    //             }
    //         };
    //         if (mutationList[i].type == "attributes") {
    //             console.log("mutatlist length is " + mutationList.length);
    //             for (k=0; k < mutationList.length; k++) {
    //                 if (mutationList[k].target.style.display == 'none') { 
    //                     // testArray.filter(card => card !== mutationList[k].target.id);
    //                     console.log("none test")
    //                 } else if (mutationList[k].target.style.display == 'block') {
    //                     // testArray.push(mutationList[k].target.id)
    //                     console.log("block test")
    //                 };
    //             };
    //         };
    //     }
    //     testArray.forEach (item => {
    //         console.log(item);
    //     });
    // };
    // const observer = new MutationObserver(callback);
    // observer.observe(targetNode, config);
});

//dynamic array listening for changes in search results for dynamic pagination

//load more function
function textFilter(queryType, queryText) {
    searchQuery(filterTest(tempDictionary, queryType, queryText));
};

function changeFilter() {
    // change filter based on option select
}

function filterTest(array, type, query) {
    console.log(type, query);
    let tempArray = tempDictionary;
    tempArray = array.filter(card => card[type].includes(query));
    return tempArray;
};

function loadCards() {
    fetch ('load_cards')
        .then(response => response.json())
        .then(results => {
            results.forEach(card => {
                cardName = card['name'];
                cardName = new cardObject(
                    card['name'],
                    card['gametext'],
                    card['lore'],
                    card['image'],
                    card['type'],
                    card['side'],
                    card['subType'],
                )
                if (card['side'] == "Light") {
                    lightDictionary.push(cardName);
                } else {
                    darkDictionary.push(cardName);
                }
            })
        });
};

function searchCards() {
    let cardSide = document.querySelector('#side').value;
    if (cardSide == "Light") {
        searchQuery(lightDictionary);
        tempDictionary = JSON.parse(JSON.stringify(lightDictionary));
    } else {
        searchQuery(darkDictionary);
        tempDictionary = JSON.parse(JSON.stringify(darkDictionary));
    };
};

function searchQuery(object) {
    count = 0;
    console.log(object.length)
    //loader displays while populating, hidden after finishing
    // let loader = document.querySelector("#loading");
    // loader.classList.add("display");
    let resultDiv = document.querySelector('#searchResults');
    resultDiv.innerHTML = "";
    for (const card of object) {
        count++;
        if(count>100) {
            break;
        }
        let name = card.name;
        let image = card.image;
        let lore = card.lore;
        let imageUrl = image.replace("C:/Users/Jx1/Documents/GitHub/projects/cardSearch/", "");
        let finalImage = imageUrl.replaceAll('"', '');
        let gametext = card.gametext;
        let type = card.type;
        let subType = card.subType;
        let resultCard = document.createElement('div');
        resultCard.setAttribute('class', 'card');
        if(subType=="Site"){
            let rotatedCard = document.createElement('div');
            rotatedCard.classList.add('site-wrapper');
            let imageElement = document.createElement('img');
            imageElement.classList.add('site');
            imageElement.setAttribute('src', `${finalImage}`);
            imageElement.setAttribute('loading', 'lazy');
            rotatedCard.append(imageElement);
            resultCard.append(rotatedCard);
        } else {
            let imageElement = document.createElement('img');
            imageElement.setAttribute('src', `${finalImage}`);
            imageElement.setAttribute('loading', 'lazy');
            resultCard.append(imageElement);
        };
        resultCard.setAttribute('data-type', type);
        resultCard.setAttribute('id', name);
        resultCard.setAttribute('data-gametext', gametext);
        resultCard.setAttribute('data-lore', lore);
        resultCard.addEventListener('click', (e) => {
            if(e.shiftKey) {
                draggableZoom(finalImage, subType)
            } else {
                addCard(card);
            }
        });
        resultDiv.append(resultCard);
    };
    document.querySelector("#resultCount").innerHTML = "showing " + count + " results out of " + object.length;
};

function draggableZoom(finalImage, subType) {
    var cardDiv = document.createElement('div');
    cardDiv.classList.add("focusCardDiv");
    //add second div that changes the dimensions of the first div, give the movable properties to focusCardDiv, and the dimensions to the next div
    if(subType == "Site") {
        console.log('working');
        let rotatedCard = document.createElement('div');
        rotatedCard.classList.add('site-wrapper');
        var imageElement = document.createElement('img');
        imageElement.classList.add('site');
        imageElement.setAttribute("src", `${finalImage}`);
        imageElement.classList.add('focusSite');
    } else {
        var imageElement = document.createElement('img');
        imageElement.setAttribute('src', `${finalImage}`);
        imageElement.setAttribute('loading', 'lazy');
        imageElement.classList.add('focusCard');
    };
    cardDiv.append(imageElement);
    document.body.append(cardDiv);
    dragElement(cardDiv);
    cardDiv.addEventListener('click', (e) => {
        if(e.shiftKey) {
            cardDiv.style.display = "none";
        }
    })
}
//change this, for each card in the deckOnDeck, we are going to populate our deck area
//create each card a an object with properties, or add the full object 
//seperate both boxes. populated deck will be its own array
//create copy of object, add copy to deck
function addCard(card) {
    var newCard = true;
    for (i = 0; i < deckOnDeck.length; i++) {
        let tempCard = deckOnDeck[i]
        if(tempCard.name == card.name) {
            tempCard.count += 1;
            newCard = false;
            break;
        }
        else {
            continue;
        }
    };
    if (newCard) {
        var addCard = card;
        addCard.count = 1;
        deckOnDeck.push(addCard);
    }
    deckArea();
    // addCard.setAttribute('class', 'deckCard');
    // addCard.setAttribute('id', `${card.name}`)
    // addCard.setAttribute('src', `${finalImage}`);
    // deckArea.appendChild(addCard);
    // deckTotal();
    // addCard.addEventListener('click', () => deleteCard(card));
};

function deckArea() {
    let deckArea = document.querySelector("#deckBuilder");
    deckArea.innerHTML = '';
    for(i = 0; i < deckOnDeck.length; i++) {
        let tempCard = deckOnDeck[i];
        let parentContainer = document.createElement("div");
        parentContainer.classList.add("cardContainer");
        //add site transform
        let cardDiv = document.createElement('div');
        cardDiv.classList.add('deckCard');
        let imageUrl = tempCard.image.replace("C:/Users/Jx1/Documents/GitHub/projects/cardSearch/", "");
        let finalImage = imageUrl.replaceAll('"', '');
        if (deckOnDeck[i].subType == "Site"){
            let rotatedCard = document.createElement('div');
            rotatedCard.classList.add('site-wrapper');
            let imageElement = document.createElement('img');
            imageElement.classList.add('deckSite');
            imageElement.setAttribute('src', `${finalImage}`);
            imageElement.setAttribute('loading', 'lazy');
            rotatedCard.append(imageElement);
            cardDiv.append(rotatedCard);
        } else {
            let imageElement = document.createElement('img');
            imageElement.setAttribute('src', `${finalImage}`);
            imageElement.setAttribute('loading', 'lazy');
            cardDiv.append(imageElement);
        };
        if (tempCard.count > 1) {
            let newWidth = 90 + (10*(tempCard.count - 1));
            parentContainer.style.width = `${newWidth}px`;
            for (j=0; j<tempCard.count; j++) {
                //add card to the container
                //make a copy of the cardiv and append a new copy to the stack
                //set attribute of all cards after 1 to have x left padding and z-index to be over the next card
                //need new div new translate off last element, put div in div to translate off previous
                let childDiv = document.createElement('div');
                let copyDiv = cardDiv;
                childDiv.classList.add("child");
                childDiv.style.left = `${j*10}px`;
                console.log(childDiv.style.left);
                console.log(copyDiv);
                childDiv.append(copyDiv);
                parentContainer.append(childDiv);
            };
        } else { 
            console.log("one card");
            parentContainer.append(cardDiv);
        };
        deckArea.append(parentContainer);
        parentContainer.addEventListener('click', () => deleteCard(tempCard, cardDiv));
    }; 
    deckTotal();
};
function deckTotal() {   
    //add function to calculate counts of cards
    var total = deckOnDeck.length;
    let deckCount = document.querySelector('#deckCount');
    deckCount.innerHTML = `${total}`;
    if(total == 60) {
        document.querySelector('#buttonSubmit').disabled = false;
    }
    else{document.querySelector('#buttonSubmit').disabled = true;}
};

function deleteCard(card, cardDiv){
    console.log(cardDiv);
    if ( card.count > 1) {
        card.count -= 1;
    } else {
        let tempIndex = deckOnDeck.indexOf(card);
        deckOnDeck.splice(tempIndex, 1);
    }
    let deckDiv = document.querySelector("#deckBuilder");
    console.log(deckDiv);
    deckDiv.parentNode.removeChild(cardDiv);
    deckTotal();
    deckArea();
    //delete card from deck area
    //feed div info and delete divinfrom from parent
    //deckDiv.parentNode.removeChild(cardDiv)
}

function buildDeck(event) {
    event.preventDefault()
    var deckName = document.getElementById('deckName').value;
    fetch('deck_check' + "/" + deckName, {method:'get'})
        .then(response=>response.json())
        .then((data)=> {
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
dragElement(document.getElementById("focusCardDiv"));
//draggable zoom card function
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id)) {
        document.getElementById(elmnt.id).onmousedown = dragMouseDown;
    } else {
    elmnt.onmousedown = dragMouseDown;
    }
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
function deckArea() {
    let deckArea = document.querySelector("#deckBuilder");
    deckArea.innerHTML = '';
    for(i = 0; i < deckOnDeck.length; i++) {
        let tempCard = deckOnDeck[i];
        let parentContainer = document.createElement("div");
        let parentWidth = 90 + (10*(tempCard.count - 1));
        parentContainer.style.width = `${parentWidth}px`;
        parentContainer.classList.add("cardContainer");
        for(j = 0; j < tempCard.count; j++){
            //add site transform
            let cardDiv = document.createElement('div');
            cardDiv.classList.add("child", "deckCard");
            let imageUrl = tempCard.image.replace("C:/Users/Jx1/Documents/GitHub/projects/cardSearch/", "");
            let finalImage = imageUrl.replaceAll('"', '');
            if (deckOnDeck[i].subType == "Site"){
                let rotatedCard = document.createElement('div');
                rotatedCard.classList.add('site-wrapper');
                let imageElement = document.createElement('img');
                imageElement.classList.add('deckSite');
                imageElement.setAttribute('src', `${finalImage}`);
                imageElement.setAttribute('loading', 'lazy');
                rotatedCard.append(imageElement);
                cardDiv.append(rotatedCard);
            } else {
                let imageElement = document.createElement('img');
                imageElement.setAttribute('src', `${finalImage}`);
                imageElement.setAttribute('loading', 'lazy');
                cardDiv.append(imageElement);
            };
            if (j > 0) {
                cardDiv.style.left = `${j*10}px`;
            }
        if (tempCard.count > 1) {
            let newWidth = 90 + (10*(tempCard.count - 1));
            parentContainer.style.width = `${newWidth}px`;
            for (j=0; j<tempCard.count; j++) {
                //add card to the container
                //make a copy of the cardiv and append a new copy to the stack
                //set attribute of all cards after 1 to have x left padding and z-index to be over the next card
                //need new div new translate off last element, put div in div to translate off previous
                let childDiv = document.createElement('div');
                let copyDiv = cardDiv;
                cardDiv.classList.add("child");
                childDiv.style.left = `${j*10}px`;
                console.log(childDiv.style.left);
                console.log(copyDiv);
                childDiv.append(copyDiv);
                parentContainer.append(childDiv);
            };
        } else { 
            console.log("one card");
            parentContainer.append(cardDiv);
        };
        deckArea.append(parentContainer);
        parentContainer.addEventListener('click', () => deleteCard(tempCard, cardDiv));
    }; 
    deckTotal();
};