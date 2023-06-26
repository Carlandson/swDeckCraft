// card dictionaries
const lightDictionary = [];
const darkDictionary = [];
var tempDictionary = [];
var tempArray = [];
var count = 0;
var deckOnDeck = [];
var sixtyFirstCards = [];
var cardsOutsideDeck = [];
var randomHand = [];
var parameterArray = [];
var parameterCount = 0;
var currentSearchType = "Null";
var currentSearchQuery = "Null";
var currentSet = "Null";
var activeDiv = "deck";

class searchObject {
    constructor(
        property,
        operator,
        query
    ) {
        this.property = property;
        this.operator = operator;
        this.query = query;
    }
};
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
        destiny,
        power,
        ability,
        deploy,
        forfeit,
        set,
    ) {
    this.name = name;
    this.gametext = gametext;
    this.lore = lore;
    this.image = image;
    this.type = type;
    this.side = side;
    this.subType = subType;
    this.gempId = gempId;
    this.destiny = destiny;
    this.power = power;
    this.ability = ability;
    this.deploy = deploy;
    this.forfeit = forfeit;
    this.set = set;
    }
};


document.addEventListener('DOMContentLoaded', () => {
    loadCards();
    var cardAreas = document.getElementsByClassName("cardArea");
    // for (i = 0; i < cardAreas.length; i++) {
    //     cardAreas[i].addEventListener('click', function () {
    //         for (j = 0; j < cardAreas.length; j++) {
    //             cardAreas[j].classList.remove('active');
    //         };
    //         this.classList.toggle('active');
    //     });
    // };
    document.querySelector('#importLightDeck').addEventListener('change', () => {importLightDeck()});
    document.querySelector('#importDarkDeck').addEventListener('change', () => {importDarkDeck()});
    document.querySelector('#saveDeck').addEventListener('click', () => saveDeck(deckOnDeck));
    document.querySelector('#side').addEventListener('change', () => searchCards());
    document.querySelector('#lsShields').addEventListener('click', () => addShields());
    document.querySelector('#sortDeckByType').addEventListener('click', () => sortDeck());
    document.querySelector('#sortDeckByName').addEventListener('click', () => sortAlphabet());
    document.querySelector('#clearDeck').addEventListener('click', () => clearDeck());
    document.querySelector('#randomHandButton').addEventListener('click', () => randomStartingHand());
    // document.querySelector('#optionOne').addEventListener('change', () => typeFilter(tempDictionary, document.querySelector('#optionOne').value));
    document.querySelector('#optionOne').addEventListener('change', () => typeFilterTest(document.querySelector('#optionOne').value));
    // document.querySelector('#setOption').addEventListener('change', () => setFilter(tempDictionary, document.querySelector('#setOption').value));
    document.querySelector('#setOption').addEventListener('change', () => setFilterTest(document.querySelector('#setOption').value));
    // document.querySelector('#textSearchOne').addEventListener('input', () => textFilter(document.querySelector('#searchOneType').value, document.querySelector('#secondaryParameter').value, document.querySelector('#textSearchOne').value));
    document.querySelector('#textSearchOne').addEventListener('input', () => textFilterTest(document.querySelector('#searchOneType').value, document.querySelector('#secondaryParameter').value, document.querySelector('#textSearchOne').value));
    // document.querySelector('#saveParameter').addEventListener('click', () => saveParameters(document.querySelector('#searchOneType').value, document.querySelector('#secondaryParameter').value, document.querySelector('#textSearchOne').value));
    document.querySelector('#side').value = "choose";
    document.querySelector('#optionOne').value = "choose";
    document.querySelector('#setOption').value = "chooseSet";
    document.querySelector('#resultCount').innerHTML = count;
    document.querySelector('#shieldButton').addEventListener('click', () => defensiveShieldTest());
    document.querySelector('#sixtyFirstButton').addEventListener('click', () => sixtyFirstTest());
    // var collapsibles = document.getElementsByClassName("collapsible");
    // for(i = 0; i < collapsibles.length; i++){
    //     collapsibles[i].addEventListener('click', function() {
    //         this.classList.toggle('open');
    //         var content = this.nextElementSibling;
    //         if (content.style.display === "block"){
    //             content.style.display = "none";
    //         } else {
    //             content.style.display = "block";
    //         };
    // });
    // };    
    let bars = document.querySelectorAll('.searchBar');
    bars.forEach(bar => {
        bar.value = "";
    });
});

function defensiveShieldTest() {
    var mainDeck = document.querySelector('#deckBuilder');
    var sixtyFirstDiv = document.querySelector('#sixtyFirst');
    var defensiveShieldDiv = document.querySelector('#cardsOutsideDeck');
    if (defensiveShieldDiv.style.display == "flex"){
        defensiveShieldDiv.style.display = "none";
        activeDiv = "deck";
    } else {
        defensiveShieldDiv.style.display = "flex";
        sixtyFirstDiv.style.display = "none";
        activeDiv = "defensive";
    };
};

function sixtyFirstTest() {
    var mainDeck = document.querySelector('#deckBuilder');
    var sixtyFirstDiv = document.querySelector('#sixtyFirst');
    var defensiveShieldDiv = document.querySelector('#cardsOutsideDeck');
    if (sixtyFirstDiv.style.display == "flex"){
        sixtyFirstDiv.style.display = "none";
        activeDiv = "deck";
        mainDeck.classList.remove("opaque");
    } else {
        sixtyFirstDiv.style.display = "flex";
        defensiveShieldDiv.style.display = "none";
        activeDiv = "sixtyFirst";
        mainDeck.classList.add("opaque");
    };
};

function textFilter(property, operator, query) {
    if (!query) {
        searchQuery(tempDictionary);
    } else {searchParameter = new searchObject(
        property,
        operator,
        query,
    );
    parameterArray[parameterCount] = searchParameter;
    array = tempDictionary;
    searchQuery(dynamicSearchArray(array));
    }; 
};

function textFilterTest(property, operator, query) {
    searchParameter = new searchObject(
        property,
        operator,
        query,
    );
    currentSearchQuery = searchParameter;
    newSearchArrayTest();
};
function typeFilterTest(cardType){
    currentSearchType = cardType;
    newSearchArrayTest();
};

function setFilterTest(set){
    currentSet = set;
    newSearchArrayTest();
};

function newSearchArrayTest() {
    tempArray = tempDictionary;
    if (currentSearchType != "Null") {
        tempArray = tempArray.filter(card => card.type == currentSearchType);
    }
    if (currentSet != "Null"){
        tempArray = tempArray.filter(card => card.set == currentSet);
    }
    if (currentSearchQuery != "Null") {
        let property = currentSearchQuery.property;
        let operator = currentSearchQuery.operator;
        let query = currentSearchQuery.query;
        if(currentSearchQuery.operator == "contains") {
            tempArray = tempArray.filter(card => card[property].toLowerCase().includes(query.toLowerCase()));
        } else {
            temp = tempArray.filter(card => card.type == currentSearchType);
            tempArray = temp.reduce(card => evaluate(card, property, query, operator));
        };
    };
    searchQuery(tempArray);
}
function typeFilter(array, cardType) {
    if (cardType == "Null") {
        if (set == "Null") {
            tempArray = array;
        } else {
            temp = array.filter(card => card.set == set);
            tempArray = temp.filter(card => card.type == cardType);
        };
    } else {
        temp = array.filter(card => card.set == set);
        tempArray = array.filter(card => card.type == cardType);
    };
    currentSearchType = cardType;
    searchQuery(tempArray);
};

function setFilter(array, set) {
    if (set == "Null") {
        tempArray = array;
    } else {
        tempArray = array.filter(card => card.set == set);
    };
    currentSet = set;
    searchQuery(tempArray);
};

function dynamicSearchArray (array) {
    var temp;
    var tempArray;
    if (currentSearchType == "Null") {
        tempArray = array;
    } else {
        tempArray = array.filter(card => card.type == currentSearchType)
    }
    for(i = 0; i < parameterArray.length; i++) {
        let operator = parameterArray[i].operator;
        let property = parameterArray[i].property;
        let query = parameterArray[i].query;
        if (operator == "contains") {
            if (currentSearchType == "Null") {
                tempArray = array.filter(card => card[property].toLowerCase().includes(query.toLowerCase()));
            } else {
                temp = array.filter(card => card.type == currentSearchType);      
                tempArray = temp.filter(card => card[property].toLowerCase().includes(query.toLowerCase()));
            };
        } else {
            if (currentSearchType == "Null") {
                tempArray = array.filter(card => evaluate(card, property, query, operator));
            } else {
                temp = array.filter(card => card.type == currentSearchType);
                tempArray = temp.reduce(card => evaluate(card, property, query, operator));
            };
        };
    };
    return tempArray;
};

function filterTest(array, searchObject, cardType) {
    let query = searchObject.query;
    let property = searchObject.property;
    let operator = searchObject.operator;
    var temp;
    var tempArray;
    if (operator == "contains"){
        if (cardType == "Null") {
            tempArray = array.filter(card => card[property].includes(query));
        } else {
            temp = array.filter(card => card.type == cardType);      
            tempArray = temp.filter(card => card[property].includes(query));
        };
        return tempArray;
    };
};

function SaveParameters(property, operator, query) {
    searchParameter = new searchObject(
        property,
        operator,
        query,
    );
    parameterArray.append(searchParameter);
    let parameterIconDiv = document.querySelector("#parameterDiv");
    let newParameterIcon = document.createElement("button");
    newParameterIcon.innerHTML = `${type + operator, query}`;
    parameterIconDiv.appendChild(newParameterIcon);
};

function loadCards() {
    fetch ('load_cards')
        .then(response => response.json())
        .then(results => {
            results.forEach(card => {
                // cardName = card['name'];
                cardName = new cardObject(
                    card['name'],
                    card['gametext'],
                    card['lore'],
                    card['image'],
                    card['type'],
                    card['side'],
                    card['subType'],
                    card['gempId'],
                    card['destiny'],
                    card['power'],
                    card['ability'],
                    card['deploy'],
                    card['forfeit'],
                    card['set'],
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
    newSearchArrayTest();
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
        let destiny = card.destiny;
        // let power = card.power;
        // let ability = card.ability;
        // let deploy = card.deploy;
        // let forfeit = card.forfeit;
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
        resultCard.setAttribute('destiny', destiny);
        resultCard.addEventListener('click', (e) => {
            if(e.shiftKey) {
                draggableZoom(finalImage, subType)
            } else {
                if(activeDiv == "deck") {
                    addCard(deckOnDeck, card);
                } else if(activeDiv == "defensive") {
                    addCard(cardsOutsideDeck, card);
                } else if(activeDiv == "sixtyFirst") {
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
        let rotatedCard = document.createElement('div');
        rotatedCard.classList.add('site-wrapper');
        var imageElement = document.createElement('img');
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
    deckPopulate(activeArray);
};

function deckPopulate(activeArray) {
    var deckArea;
    if(activeDiv == "deck") {
        deckArea = document.querySelector("#deckBuilder");
    } else if(activeDiv == "sixtyFirst") {
        deckArea = document.querySelector("#sixtyFirst");
    } else if(activeDiv =="defensive") {
        deckArea = document.querySelector('#cardsOutsideDeck');
    } else if(activeDiv == "random") {
        deckArea = document.querySelector('#randomHand');
    };
    deckArea.innerHTML = '';
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
                rotatedCard.append(imageElement);
                cardDiv.append(rotatedCard);
                if (j == tempCard.count - 1) {
                    if(tempCard.startingCard) {
                        console.log("once")
                        imageElement.classList.add('starting');
                    };
                };
                cardDiv.addEventListener('click', (e) => {
                    if(e.shiftKey) {
                        draggableZoom(finalImage, "Site")
                    } if(e.ctrlKey) {
                        if (!tempCard.startingCard) {
                            imageElement.classList.toggle('starting');
                            tempCard.startingCard = true;
                        } else if (tempCard.startingCard){
                            imageElement.classList.toggle('starting');
                            tempCard.startingCard = false;
                        };
                    } else {
                        deleteCard(activeArray, tempCard);
                    };
                });
            } else {
                let imageElement = document.createElement('img');
                imageElement.setAttribute('src', `${finalImage}`);
                imageElement.setAttribute('mix-blend-mode', 'multiply');
                cardDiv.append(imageElement);
                if (j == tempCard.count - 1) {
                    if(tempCard.startingCard) {
                        imageElement.classList.add('starting');
                    };
                };
                cardDiv.addEventListener('click', (e) => {
                    console.log(e)
                    if(e.shiftKey) {
                        draggableZoom(finalImage, tempCard.subType)
                    } else if(e.ctrlKey) {
                        console.log("control pressed")
                        if (!tempCard.startingCard) {
                            imageElement.classList.toggle('starting');
                            tempCard.startingCard = true;
                        } else if (tempCard.startingCard) {
                            imageElement.classList.toggle('starting');
                            tempCard.startingCard = false;
                        };
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
    let deckAverageDestiny = document.querySelector('#averageDestiny');
    var totalDestiny = 0;
    for (i = 0; i < deckOnDeck.length; i++) {
        totalDestiny += deckOnDeck[i].destiny * deckOnDeck[i].count;
    }
    let destinyAverage = totalDestiny / getDeckTotal;
    deckCount.innerHTML = `${getDeckTotal}`;
    deckAverageDestiny.innerHTML = `${destinyAverage.toFixed(2)}`;
};

//stoppage june 9th, figure out delete card too tired
function deleteCard(activeArray, card){
    card.count = card.count - 1;
    if (card.count == 0) {
        let tempIndex = activeArray.indexOf(card);
        activeArray.splice(tempIndex, 1);
    };
    deckPopulate(activeArray);
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
    let deckList = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>` + `\n` + `<deck>`;
    deckList = deckList + `\n`;
    for (i = 0; i < deckOnDeck.length; i++){
        let tempCard = deckOnDeck[i].name;
        tempCard = replaceString(tempCard);
        deckList = deckList + `    <card blueprintId="${deckOnDeck[i].gempId}" title="${tempCard}"/>\n`.repeat(deckOnDeck[i].count);
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
    deckOnDeck = [];
    let importFile = document.querySelector('#importLightDeck').files;
    if (importFile.length == 0) return;
    const importedDeck = importFile[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target.result;
        var deck = [];
        var cleanedDeck = [];
        var outsideCards = [];
        var regBrackets = /\<(.*?)\>/g;
        var reg = /\"(.*?)\"/g;
        file.match(regBrackets).forEach((element) => {
            deck.push(element);
        });
        for (i = 0; i < deck.length; i++) {
            var outsideDeck = true;
            //opt-chaining operator skips null
            if(deck[i].match("card b")){
                outsideDeck = false;
            };
            deck[i].match(reg)?.forEach((element) => {
                if(element.includes("_")) {
                    element = element.replace(/["]/g, '');
                    if(!outsideDeck) {
                        cleanedDeck.push(element);
                    } else {
                        outsideCards.push(element);
                    };
                };
            });
        };
        try {
            cleanedDeck.forEach((card) => {
                var matchingCard = lightDictionary.find(item => item.gempId == card);
                if (matchingCard === undefined) throw "Wrong Side!";
                addCard(deckOnDeck, matchingCard);
            });
        } catch (e) {
            alert(e);
        };
    };
    reader.onerror = (e) => alert("check" + e.target.error.name);
    reader.readAsText(importedDeck);        
};

function importDarkDeck() {
    deckOnDeck = [];
    let importFile = document.querySelector('#importDarkDeck').files;
    if (importFile.length == 0) return;
    const importedDeck = importFile[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        const file = e.target.result;
        var deck = [];
        var cleanedDeck = [];
        var outsideCards = [];
        var regBrackets = /\<(.*?)\>/g;
        var reg = /\"(.*?)\"/g;
        file.match(regBrackets).forEach((element) => {
            deck.push(element);
        });
        for (i = 0; i < deck.length; i++) {
            var outsideDeck = true;
            //opt-chaining operator skips null
            if(deck[i].match("card b")){
                outsideDeck = false;
            };
            deck[i].match(reg)?.forEach((element) => {
                if(element.includes("_")) {
                    element = element.replace(/["]/g, '');
                    if(!outsideDeck) {
                        cleanedDeck.push(element);
                    } else {
                        outsideCards.push(element);
                    };
                };
            });
        };
        //file is a string
        //file is going to fetch each card from the dictionary, then use the addcard function to add them to the deckview
        //we need to clean the string up first - or we can parse the string and find matches in the dictionary to add without needing to change string at all
        try {
            cleanedDeck.forEach((card) => {
                var matchingCard = darkDictionary.find(item => item.gempId == card);
                if (matchingCard === undefined) throw "Wrong Side!";
                addCard(deckOnDeck, matchingCard);
            });
            // outsideCards.forEach((card) => {
            //     var matchingCard = darkDictionary.find(item => item.gempId == card);
            //     if (matchingCard === undefined) throw "Wrong Side!";
            //     addCard(cardsOutsideDeck, matchingCard);
            // });
        } catch (e) {
            alert(e);
        };
    };
    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(importedDeck);
};

//evaulate
function evaluate(card, parameter1, parameter2, operator) {
    if(card[parameter1]) {
        if(operator == "equals") {
            if (card[parameter1] == parameter2){
                return card;
            };
        } else if(operator == "greaterThan") {
            if (card[parameter1] > parameter2){
                return card;
            };
        } else if(operator == "lessThan") {
            if (card[parameter1] < parameter2){
                return card;
            };
        } else if(operator == "lessThanEqualTo") {
            if (card[parameter1] <= parameter2){
                return card;
            };
        } else if(operator == "greaterThanEqualTo") {
            if (card[parameter1] >= parameter2){
                return card;
            };
        };
    };
    //eval is security risk
    // return eval(parameter1 + operator + parameter2);
};

function sortDeck() {
    deckOnDeck.sort(function(a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        nameA = nameA.replace("Â€¢", "");
        nameA = nameA.replace("Â€¢", "");
        nameB = nameB.replace("Â€¢", "");
        nameB = nameB.replace("Â€¢", "");
        if (nameA > nameB) {
            return 1;
        } if (nameA < nameB) {
            return -1;
        } else{
            return 0;
        }
    });
    deckOnDeck.sort(function(a, b) {
        const typeA = a.type.toUpperCase();
        const typeB = b.type.toUpperCase();
        if (typeA > typeB) {
            return 1;
        } if (typeA < typeB) {
            return -1;
        } else{
            return 0;
        }
    });
    deckPopulate(deckOnDeck);
};

function sortAlphabet() {
    deckOnDeck.sort(function(a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        nameA = nameA.replace("Â€¢", "");
        nameA = nameA.replace("Â€¢", "");
        nameA = nameA.replace("<>", "");
        nameA = nameA.replace("<>", "");
        nameA = nameA.replace("<>", "");
        nameB = nameB.replace("Â€¢", "");
        nameB = nameB.replace("Â€¢", "");
        nameB = nameB.replace("<>", "");
        nameB = nameB.replace("<>", "");
        nameB = nameB.replace("<>", "");
        if (nameA > nameB) {
            return 1;
        } if (nameA < nameB) {
            return -1;
        } else{
            return 0;
        }
    });
    deckPopulate(deckOnDeck);
};

function addShields() {
    activeDiv = "cardsOutsideDeck";
    if (cardsOutsideDeck.length > 0) {
        let deckArea = document.querySelector('#cardsOutsideDeck');
        cardsOutsideDeck = [];
        deckArea.innerHTML = '';
    } else {
        var tempDeck = tempDictionary.filter(card => card.type == "Defensive Shield");
        for(i = 0; i < tempDeck.length; i++) {
            tempDeck[i].count = 1;
            cardsOutsideDeck.push(tempDeck[i]);
        };
        deckPopulate(cardsOutsideDeck);
    };
};

function clearDeck() {
    let deckArea = document.querySelector('#deckBuilder');
    deckOnDeck = [];
    deckArea.innerHTML = '';
    deckTotal();
};

function randomStartingHand () {
    var randomHandDiv = document.querySelector('#randomHand');
    if (activeDiv == "deck") {
        activeDiv = "random";
        randomHandDiv.style.display = 'flex';
        var newArray = deckOnDeck.filter(card => !card.startingCard);
        var temp = [];
        console.log(temp)
        for(i=0;i<newArray.length;i++){
            if(newArray[i].count > 0) {
                var tempObject = newArray[i];
                count = newArray[i].count
                for(j=0; j < count; j++) {
                    tempObject.count = 1;
                    temp.push(tempObject);
                }
            } else{
                temp.push(newArray[i]);
            }
        };
        console.log(temp)
        randomHand = [];
        var tempNumber = 0;
        for(i=0; i<8; i++) {
            var randomCard = Math.floor(Math.random() * temp.length);
            randomHand.push(temp[randomCard]);
            temp.splice(randomCard, 1);
        };
        console.log(temp)
        deckPopulate(randomHand);
    } else if (randomHandDiv.style.display == 'flex') {
        randomHandDiv.style.display = "none"
        activeDiv = "deck";
    };
};

function replaceString(tempCard) {
    tempCard = tempCard.replace("â€¢", "");
    tempCard = tempCard.replace("â€¢", "");
    tempCard = tempCard.replace("â€¢", "");
    tempCard = tempCard.replace("<>", "");
    tempCard = tempCard.replace("<>", "");
    tempCard = tempCard.replace("<>", "");
    tempCard = tempCard.replace(" (V)", "");
    tempCard = tempCard.replace(" (AI)", "");
    var temp = tempCard.split("/");
    tempCard = temp[0];
    tempCard = tempCard.trim();
    tempCard = tempCard.replace('&', '&amp;');
    return tempCard;
}