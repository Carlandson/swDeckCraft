// card dictionaries
const lightDictionary = [];
const darkDictionary = [];
var tempDictionary = [];
var tempArray = [];
var count = 0;
var deckOnDeck = [];
var sixtyFirstCards = [];
var cardsOutsideDeck = [];
var currentSearchType;

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
    var cardAreas = document.getElementsByClassName("cardArea");
    for (i = 0; i < cardAreas.length; i++) {
        cardAreas[i].addEventListener('click', function () {
            for (j = 0; j < cardAreas.length; j++) {
                cardAreas[j].classList.remove('active');
            };
            this.classList.toggle('active');
        });
    };
    document.querySelector('#importLightDeck').addEventListener('change', () => {importLightDeck()});
    document.querySelector('#importDarkDeck').addEventListener('change', () => {importDarkDeck()});
    document.querySelector('#saveDeck').addEventListener('click', () => saveDeck(deckOnDeck));
    document.querySelector('#side').addEventListener('change', () => searchCards());
    document.querySelector('#optionOne').addEventListener('change', () => changeFilter(tempDictionary, document.querySelector('#optionOne').value));
    document.querySelector('#textSearchOne').addEventListener('input', () => textFilter(document.querySelector('#searchOneType').value, document.querySelector("#textSearchOne").value));
    document.querySelector('#side').value = "choose";
    document.querySelector('#resultCount').innerHTML = count;
    var collapsibles = document.getElementsByClassName("collapsible");
    for(i = 0; i < collapsibles.length; i++){
        collapsibles[i].addEventListener('click', function() {
            this.classList.toggle('open');
            var content = this.nextElementSibling;
            if (content.style.display === "flex"){
                content.style.display = "none";
            } else {
                content.style.display = "flex";
            };
    });
    };    
    let bars = document.querySelectorAll('.searchBar');
    bars.forEach(bar => {
        bar.value = "";
    });
});

function textFilter(queryType, queryText) {
    searchQuery(filterTest(tempDictionary, queryType, queryText, currentSearchType));
};

function changeFilter(array, cardType) {
    // cardType = `"${cardType}"`;
    if (cardType == "Null") {
        tempArray = array;
    } else {
        tempArray = array.filter(card => card.type == cardType);
    };
    currentSearchType = cardType;
    searchQuery(tempArray);
};

function filterTest(array, type, query, cardType) {
    console.log(type, query);
    var temp;
    var tempArray;
    if (cardType == "Null") {
        tempArray = array.filter(card => card[type].includes(query));
    } else {
        temp = array.filter(card => card.type == cardType);
        console.log(temp);
        tempArray = temp.filter(card => card[type].includes(query));
        console.log(tempArray);
    };
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
                    card['gempId'],
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
    //loader displays while populating, hidden after finishing
    // let loader = document.querySelector("#loading");
    // loader.classList.add("display");
    let resultDiv = document.querySelector('#searchResults');
    resultDiv.innerHTML = "";
    for (const card of object) {
        count++;
        if(count>100) {
            break;
        };
        let name = card.name;
        let image = card.image;
        let lore = card.lore;
        let imageUrl = image.replace("C:/Users/Jx1/Documents/GitHub/projects/cardSearch/", "");
        let finalImage = imageUrl.replaceAll('"', '');
        let gametext = card.gametext;
        let type = card.type;
        let subType = card.subType;
        let gempId = card.gempId;
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
        resultCard.setAttribute('gempId', gempId);
        resultCard.addEventListener('click', (e) => {
            if(e.shiftKey) {
                draggableZoom(finalImage, subType)
            } else {
                currentDiv = document.querySelector(".active").id;
                if(currentDiv == "deckBuilder") {
                    addCard(deckOnDeck, card);
                } else if(currentDiv == "cardsOutsideDeck") {
                    addCard(cardsOutsideDeck, card);
                } else if(currentDiv == "sixtyFirst") {
                    addCard(sixtyFirstCards, card);
                };
            }
        });
        resultDiv.append(resultCard);
    };
    document.querySelector("#resultCount").innerHTML = "showing " + count + " results out of " + object.length;
};

//draggable function for zoomed card - user shift clicks
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
function addCard(activeArray, card) {
    console.log(activeArray);
    var newCard = true;
    for (i = 0; i < activeArray.length; i++) {
        let tempCard = activeArray[i]
        if(tempCard.name == card.name) {
            tempCard.count += 1;
            newCard = false;
            break;
        }
        else {
            continue;
        };
    };
    if (newCard) {
        var addCard = card;
        addCard.count = 1;
        activeArray.push(addCard);
    }
    deckArea(activeArray);
};

function deckArea(activeArray) {
    let deckArea = document.querySelector(".active");
    deckArea.innerHTML = '';
    console.log("the active array is " + activeArray);
    for(i = 0; i < activeArray.length; i++) {
        let tempCard = activeArray[i];
        let parentContainer = document.createElement("div");
        let parentWidth = 90 + (10*(tempCard.count - 1));
        parentContainer.style.width = `${parentWidth}px`;
        parentContainer.classList.add("cardContainer");
        for(j = 0; j < tempCard.count; j++){
            //creates seperate div for each card
            let cardDiv = document.createElement('div');
            //moves the card to the right j*10 pixels
            if (j > 0) {cardDiv.style.left = `${j*10}px`};
            //gives card child and deckcard attributes to be controlled by parent container
            cardDiv.classList.add("child", "deckCard");
            //grabs the image, takes out the path which messes with the image display
            let imageUrl = tempCard.image.replace("C:/Users/Jx1/Documents/GitHub/projects/cardSearch/", "");
            //removes quotations from the path which also affects the image display
            let finalImage = imageUrl.replaceAll('"', '');
            if (activeArray[i].subType == "Site"){
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
                // cardDiv.addEventListener('click', () => deleteCard(tempCard));
                cardDiv.addEventListener('click', (e) => {
                    if(e.shiftKey) {
                        draggableZoom(finalImage, tempCard.subType)
                    } else {
                        deleteCard(activeArray, tempCard);
                    }
                });
            };
            parentContainer.append(cardDiv);
            };
        deckArea.append(parentContainer);
    }; 
    deckTotal();
};

function deckTotal() {   
    //reduce function calculates total with count element
    const getDeckTotal = deckOnDeck.reduce((n, {count}) => n + count, 0)
    let deckCount = document.querySelector('#deckCount');
    deckCount.innerHTML = `${getDeckTotal}`;
};
//stoppage june 9th, figure out delete card too tired
function deleteCard(activeArray, card){
    card.count = card.count - 1;
    if (card.count == 0) {
        let tempIndex = activeArray.indexOf(card);
        activeArray.splice(tempIndex, 1);
    };
    deckArea(activeArray);
};

// function buildDeck(event) {
//     event.preventDefault()
//     var deckName = document.getElementById('deckName').value;
//     fetch('deck_check' + "/" + deckName, {method:'get'})
//         .then(response=>response.json())
//         .then((data)=> {
//             if(data == true) {
//                 alert("deck exists");
//             }
//             else {
//                 var cards = document.getElementById('cards_added').getElementsByTagName("li");
//                 let deck = []
//                 for (let i=0; i< cards.length; i++){
//                     let temp = cards[i].id;
//                     deck.push(temp)
//                 };
//                 fetch('deck_build', {
//                     method: 'POST',
//                     body: JSON.stringify({
//                         name: document.querySelector('#deckName').value,
//                         author: document.querySelector('#author').value,
//                         cards: deck,
//                         side: document.querySelector('#side').value,
//                     })
//                 });
//                 alert('deck posted!');
//                 window.location.href = "http://127.0.0.1:8000";
//             };
//     });
// }
// dragElement(document.getElementById("focusCardDiv"));
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
    };
};

function saveDeck(deckOnDeck) {
    let deckList = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><deck>`;
    for (i = 0; i < deckOnDeck.length; i++){
        deckList = deckList + `<card blueprintId="${deckOnDeck[i].gempId}" title="${deckOnDeck[i].name}"/>`.repeat(deckOnDeck[i].count);
    };
    deckList = deckList + "</deck>";
    //june 3rd stoppage
    let deckName = prompt("Save deck list as: ");
    let newDeck = new File([`${deckList}`], `${deckName}.txt`);
    downloadDeck(newDeck);
}

//decksave to txt
function downloadDeck (file) {
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.parentNode.removeChild(link);
    }, 0);
};

function importLightDeck() {
    let deckArea = document.querySelector("#deckBuilder");
    deckArea.innerHTML = '';
    let importFile = document.querySelector('#importLightDeck').files;
    if (importFile.length == 0) return;
    const importedDeck = importFile[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target.result;
        //file is a string
        //file is going to fetch each card from the dictionary, then use the addcard function to add them to the deckview
        //we need to clean the string up first - or we can parse the string and find matches in the dictionary to add without needing to change string at all
        var reg = /\"(.*?)\"/g;
        var cleanedDeck = [];
        file.match(reg).forEach((element) => {
            // console.log(element);
            if(element.includes("_")) {
                element = element.replace(/["]/g, '');
                cleanedDeck.push(element);
            }
        });
        console.log(cleanedDeck);
        try {
            cleanedDeck.forEach((card) => {
                var matchingCard = lightDictionary.find(item => item.gempId == card);
                if (matchingCard === undefined) throw "Wrong Side!";
                addCard(matchingCard);
            });
        } catch (e) {
            alert(e);
        };
    };
    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(importedDeck);        
};

function importDarkDeck() {
    let importFile = document.querySelector('#importDarkDeck').files;
    if (importFile.length == 0) return;
    const importedDeck = importFile[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target.result;
        //file is a string
        //file is going to fetch each card from the dictionary, then use the addcard function to add them to the deckview
        //we need to clean the string up first - or we can parse the string and find matches in the dictionary to add without needing to change string at all
        var reg = /\"(.*?)\"/g;
        var cleanedDeck = [];
        file.match(reg).forEach((element) => {
            // console.log(element);
            if(element.includes("_")) {
                element = element.replace(/["]/g, '');
                cleanedDeck.push(element);
            }
        });
        console.log(cleanedDeck);
        try {
            cleanedDeck.forEach((card) => {
                var matchingCard = darkDictionary.find(item => item.gempId == card);
                if (matchingCard === undefined) throw "Wrong Side!";
                addCard(matchingCard);
        });
        } catch (e) {
            alert(e);
        };
    };
    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(importedDeck);
};

