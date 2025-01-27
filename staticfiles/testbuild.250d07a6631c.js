// Global search state
const searchState = {
    type: "Null",
    set: "Null",
    icon: "Null",
    query: null
};

// Unified search function
function performSearch() {
    tempArray = tempDictionary.filter(card => {
        return (searchState.type === "Null" || card.type === searchState.type) &&
               (searchState.set === "Null" || card.set === searchState.set) &&
               (searchState.icon === "Null" || card.icons.includes(searchState.icon)) &&
               (!searchState.query || matchesQuery(card, searchState.query));
    });
    
    searchQuery(tempArray);
}

// Helper function to check if a card matches the search query
function matchesQuery(card, query) {
    const { property, operator, value } = query;
    
    if (operator === "contains") {
        return card[property].toLowerCase().includes(value.toLowerCase());
    } else {
        return evaluate(card[property], value, operator);
    }
}

// Evaluate function for numeric comparisons
function evaluate(cardValue, queryValue, operator) {
    switch(operator) {
        case "equals": return cardValue == queryValue;
        case "greaterThan": return cardValue > queryValue;
        case "lessThan": return cardValue < queryValue;
        case "greaterThanEqualTo": return cardValue >= queryValue;
        case "lessThanEqualTo": return cardValue <= queryValue;
        default: return false;
    }
}

// Type filter
function typeFilter(cardType) {
    searchState.type = cardType;
    performSearch();
}

// Set filter
function setFilter(set) {
    searchState.set = set;
    performSearch();
}

// Icon filter
function iconFilter(icon) {
    searchState.icon = icon;
    performSearch();
}

// Text filter
function textFilter(property, operator, value) {
    searchState.query = { property, operator, value };
    performSearch();
}

// Main search function
function searchCards() {
    let cardSide = document.querySelector('#side').value;
    tempDictionary = cardSide === "Light" ? [...lightDictionary] : [...darkDictionary];
    side = cardSide.toLowerCase();
    performSearch();
}

// Function to display search results
function searchQuery(results) {
    const resultDiv = document.querySelector('#searchResults');
    resultDiv.innerHTML = "";
    
    results.slice(0, 100).forEach(card => {
        const resultCard = createCardElement(card);
        resultDiv.appendChild(resultCard);
    });
    
    document.querySelector("#resultCount").innerHTML = `showing ${Math.min(results.length, 100)} results out of ${results.length}`;
}

// Helper function to create a card element
function createCardElement(card) {
    const resultCard = document.createElement('div');
    resultCard.className = 'card';
    
    const imageElement = document.createElement('img');
    imageElement.src = card.imageUrl;
    imageElement.loading = 'lazy';
    
    if (card.subType === "Site") {
        const rotatedCard = document.createElement('div');
        rotatedCard.className = 'site-wrapper';
        rotatedCard.appendChild(imageElement);
        resultCard.appendChild(rotatedCard);
    } else {
        resultCard.appendChild(imageElement);
    }
    
    resultCard.addEventListener('click', (e) => {
        if (e.shiftKey) {
            draggableZoom(card.imageUrl, card.subType);
        } else {
            addCard(activeDiv === "deck" ? deckOnDeck : 
                    activeDiv === "cardsOutsideDeck" ? cardsOutsideDeck : 
                    sixtyFirstCards, card);
        }
    });
    
    return resultCard;
}

// Update event listeners
document.querySelector('#optionOne').addEventListener('change', (e) => typeFilter(e.target.value));
document.querySelector('#setOption').addEventListener('change', (e) => setFilter(e.target.value));
document.querySelector('#icon').addEventListener('change', (e) => iconFilter(e.target.value));
document.querySelector('#textSearchOne').addEventListener('input', (e) => {
    const property = document.querySelector('#searchOneType').value;
    const operator = document.querySelector('#secondaryParameter').value;
    textFilter(property, operator, e.target.value);
});
document.querySelector('#secondaryParameter').addEventListener('change', () => {
    const property = document.querySelector('#searchOneType').value;
    const operator = document.querySelector('#secondaryParameter').value;
    const value = document.querySelector('#textSearchOne').value;
    textFilter(property, operator, value);
});





// Main search function
function searchCards() {
    let cardSide = document.querySelector('#side').value;
    tempDictionary = cardSide === "Light" ? [...lightDictionary] : [...darkDictionary];
    side = cardSide.toLowerCase();
    applyFilters();
}

// Apply all current filters
function applyFilters() {
    let filteredCards = tempDictionary;

    if (currentSearchType !== "Null") {
        filteredCards = filteredCards.filter(card => card.type === currentSearchType);
    }

    if (currentSet !== "Null") {
        filteredCards = filteredCards.filter(card => card.set === currentSet);
    }

    if (currentIcon !== "Null") {
        filteredCards = filteredCards.filter(card => card.icons.includes(currentIcon));
    }

    if (currentSearchQuery !== "Null") {
        filteredCards = applyTextFilter(filteredCards, currentSearchQuery);
    }

    displaySearchResults(filteredCards);
}

// Apply text filter
function applyTextFilter(cards, searchParams) {
    const { property, operator, query } = searchParams;

    if (operator === "contains") {
        return cards.filter(card => card[property].toLowerCase().includes(query.toLowerCase()));
    } else {
        return cards.filter(card => evaluate(card, property, query, operator));
    }
}

// Update search parameters
function updateSearchParams(type, value) {
    switch(type) {
        case 'type':
            currentSearchType = value;
            break;
        case 'set':
            currentSet = value;
            break;
        case 'icon':
            currentIcon = value;
            break;
        case 'text':
            currentSearchQuery = new SearchObject(value.property, value.operator, value.query);
            break;
    }
    applyFilters();
}

// Display search results
function displaySearchResults(cards) {
    const resultDiv = document.querySelector('#searchResults');
    resultDiv.innerHTML = "";
    count = Math.min(cards.length, 100);

    for (let i = 0; i < count; i++) {
        const card = cards[i];
        const cardElement = createCardElement(card);
        resultDiv.appendChild(cardElement);
    }

    document.querySelector("#resultCount").innerHTML = `showing ${count} results out of ${cards.length}`;
}

// Create card element for search results
function createCardElement(card) {
    const resultCard = document.createElement('div');
    resultCard.classList.add('card');

    const imageElement = document.createElement('img');
    imageElement.src = card.imageUrl;
    imageElement.loading = 'lazy';

    if (card.subType === "Site") {
        const rotatedCard = document.createElement('div');
        rotatedCard.classList.add('site-wrapper');
        rotatedCard.appendChild(imageElement);
        resultCard.appendChild(rotatedCard);
    } else {
        resultCard.appendChild(imageElement);
    }

    resultCard.addEventListener('click', (e) => handleCardClick(e, card));

    return resultCard;
}

// Handle card click in search results
function handleCardClick(e, card) {
    if (e.shiftKey) {
        draggableZoom(card.imageUrl, card.subType);
    } else {
        const targetArray = activeDiv === "deck" ? deckOnDeck : 
                            activeDiv === "cardsOutsideDeck" ? cardsOutsideDeck : 
                            activeDiv === "sixtyFirst" ? sixtyFirstCards : null;
        if (targetArray) addCard(targetArray, card);
    }
}

// Event listener setup for search-related elements
function setupSearchEventListeners() {
    document.querySelector('#side').addEventListener('change', searchCards);
    document.querySelector('#optionOne').addEventListener('change', e => updateSearchParams('type', e.target.value));
    document.querySelector('#setOption').addEventListener('change', e => updateSearchParams('set', e.target.value));
    document.querySelector('#icon').addEventListener('change', e => updateSearchParams('icon', e.target.value));
    document.querySelector('#textSearchOne').addEventListener('input', handleTextSearch);
    document.querySelector('#secondaryParameter').addEventListener('change', handleTextSearch);
}

// Handle text search input
function handleTextSearch() {
    const property = document.querySelector('#searchOneType').value;
    const operator = document.querySelector('#secondaryParameter').value;
    const query = document.querySelector('#textSearchOne').value;
    updateSearchParams('text', { property, operator, query });
}

// Evaluation function for non-"contains" operators
function evaluate(card, property, query, operator) {
    if (!card[property]) return false;

    const cardValue = card[property];
    const queryValue = parseFloat(query);

    switch(operator) {
        case "equals": return cardValue == queryValue;
        case "greaterThan": return cardValue > queryValue;
        case "lessThan": return cardValue < queryValue;
        case "lessThanEqualTo": return cardValue <= queryValue;
        case "greaterThanEqualTo": return cardValue >= queryValue;
        default: return false;
    }
}