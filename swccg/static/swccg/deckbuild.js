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
var randomHandSize = 8;
var parameterArray = [];
var parameterCount = 0;
var currentSearchType = "Null";
var currentSearchQuery = "Null";
var currentSet = "Null";
var currentIcon = "Null";
var activeDiv = "deck";
var side;
var chartTypes = [`Admiral's Orders`, 'Characters', 'Creatures', 'Effects', 'Epic Event', 'Interrupts', 'Jedi Tests', 'Locations', 'Objective', 'Starships', 'Vehicles', 'Weapons'];
var backgroundColors = ['black', 'white', 'gray', 'red', 'purple', 'lightsalmon', 'green', 'silver', 'purple', 'blue', 'lightskyblue', 'lawngreen'];
var typeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var typeChart;
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
        // image,
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
        icons = {},
        imageUrl,
    ) {
    this.name = name;
    this.gametext = gametext;
    this.lore = lore;
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
    this.icons = icons;
    this.imageUrl = imageUrl;
    this.isHolographic = false;
    }
};

const LAYOUT = {
    baseWidth: 90,
    baseHeight: 125.5,
    baseOverlap: 10,
    minScale: 0.45,
    maxScale: 4,
    stackGap: 4,
};

function isHorizontalCard(card) {
    return card.subType === 'Site' || card.horizontal === true;
}

let lastSearchResults = [];

function isAlternateImageUrl(imageUrl) {
    if (!imageUrl) {
        return false;
    }
    return imageUrl.includes('AlternateImage') || imageUrl.includes('_ai.');
}

function normalizeBlueprintId(blueprintId) {
    const raw = (blueprintId || '').trim();
    const isHolographic = /[*^]$/.test(raw);
    const baseId = raw.replace(/[*^]$/, '');
    return { baseId, isHolographic };
}

function normalizeTitle(title) {
    return (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveCard(blueprintId, title, dictionary) {
    const { baseId, isHolographic } = normalizeBlueprintId(blueprintId);
    const matches = dictionary.filter(item => item.gempId === baseId);
    if (matches.length === 0) {
        return null;
    }

    let match;
    if (matches.length === 1) {
        match = matches[0];
    } else {
        const alternateMatches = matches.filter(card => isAlternateImageUrl(card.imageUrl));
        const regularMatches = matches.filter(card => !isAlternateImageUrl(card.imageUrl));
        if (isHolographic && alternateMatches.length) {
            match = alternateMatches[0];
        } else if (!isHolographic && regularMatches.length) {
            match = regularMatches[0];
        } else {
            const normalizedTitle = normalizeTitle(title);
            match = matches.find(card => {
                const cardTitle = normalizeTitle(card.name);
                return cardTitle.includes(normalizedTitle) || normalizedTitle.includes(cardTitle);
            }) || matches[0];
        }
    }

    const copy = JSON.parse(JSON.stringify(match));
    copy.isHolographic = isHolographic;
    if (copy.subType === 'Site') {
        copy.horizontal = true;
    }
    return copy;
}

function parseDeckXml(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    if (doc.querySelector('parsererror')) {
        throw new Error('Invalid deck file format');
    }

    const main = [];
    const outside = [];
    doc.querySelectorAll('card').forEach(node => {
        main.push({
            blueprintId: node.getAttribute('blueprintId'),
            title: node.getAttribute('title'),
            horizontal: node.getAttribute('horizontal') === 'true',
        });
    });
    doc.querySelectorAll('cardOutsideDeck').forEach(node => {
        outside.push({
            blueprintId: node.getAttribute('blueprintId'),
            title: node.getAttribute('title'),
            horizontal: node.getAttribute('horizontal') === 'true',
        });
    });
    return { main, outside };
}

function parseGempCollectionXml(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    if (doc.querySelector('parsererror')) {
        throw new Error('Invalid GEMP shield collection response');
    }

    const entries = [];
    doc.querySelectorAll('collection > card').forEach(node => {
        entries.push({
            blueprintId: node.getAttribute('blueprintId'),
            horizontal: node.getAttribute('horizontal') === 'true',
        });
    });
    return entries;
}

const GEMP_SHIELD_FILES = {
    Light: '/static/swccg/gemp-shields/light.xml',
    Dark: '/static/swccg/gemp-shields/dark.xml',
};

async function fetchGempShields(deckSide) {
    const response = await fetch(GEMP_SHIELD_FILES[deckSide]);
    if (!response.ok) {
        throw new Error(`Failed to load shields (${response.status})`);
    }
    return parseGempCollectionXml(await response.text());
}

function detectDeckSide(entries) {
    let lightMatches = 0;
    let darkMatches = 0;

    entries.forEach(entry => {
        const { baseId } = normalizeBlueprintId(entry.blueprintId);
        if (lightDictionary.some(card => card.gempId === baseId)) {
            lightMatches += 1;
        }
        if (darkDictionary.some(card => card.gempId === baseId)) {
            darkMatches += 1;
        }
    });

    if (lightMatches === 0 && darkMatches === 0) {
        return null;
    }
    if (lightMatches === darkMatches) {
        return null;
    }
    return lightMatches > darkMatches ? 'Light' : 'Dark';
}

function getStackCounts(activeArray, countField) {
    return activeArray.map(card => card[countField] || 1);
}

function getStackWidth(count, cardWidth, overlap) {
    return cardWidth + overlap * (Math.max(count, 1) - 1);
}

function measureWrappedLayout(stackCounts, containerWidth, containerHeight, scale) {
    const cardWidth = LAYOUT.baseWidth * scale;
    const overlap = LAYOUT.baseOverlap * scale;
    const rowHeight = LAYOUT.baseHeight * scale + LAYOUT.stackGap;
    let rowWidth = 0;
    let rows = 1;
    let maxRowWidth = 0;

    stackCounts.forEach(count => {
        const stackWidth = getStackWidth(count, cardWidth, overlap) + LAYOUT.stackGap;
        if (rowWidth > 0 && rowWidth + stackWidth > containerWidth) {
            maxRowWidth = Math.max(maxRowWidth, rowWidth);
            rows += 1;
            rowWidth = stackWidth;
        } else {
            rowWidth += stackWidth;
            maxRowWidth = Math.max(maxRowWidth, rowWidth);
        }
    });

    return {
        cardWidth,
        overlap,
        rows,
        totalHeight: rows * rowHeight,
        maxRowWidth,
    };
}

function findOptimalScale(stackCounts, containerWidth, containerHeight) {
    let low = LAYOUT.minScale;
    let high = LAYOUT.maxScale;
    let bestScale = LAYOUT.minScale;

    for (let i = 0; i < 50; i++) {
        const mid = (low + high) / 2;
        const layout = measureWrappedLayout(stackCounts, containerWidth, containerHeight, mid);
        if (layout.maxRowWidth <= containerWidth && layout.totalHeight <= containerHeight) {
            bestScale = mid;
            low = mid;
        } else {
            high = mid;
        }
    }

    return bestScale;
}

function measureSingleRowLayout(cardCount, containerWidth, containerHeight, scale, itemGap = LAYOUT.stackGap) {
    const cardWidth = LAYOUT.baseWidth * scale;
    const overlap = LAYOUT.baseOverlap * scale;
    const rowHeight = LAYOUT.baseHeight * scale + LAYOUT.stackGap;
    const rowWidth = cardCount * cardWidth + Math.max(0, cardCount - 1) * itemGap;

    return {
        cardWidth,
        overlap,
        rows: 1,
        totalHeight: rowHeight,
        maxRowWidth: rowWidth,
    };
}

function findOptimalSingleRowScale(cardCount, containerWidth, containerHeight, itemGap = LAYOUT.stackGap) {
    let low = LAYOUT.minScale;
    let high = LAYOUT.maxScale;
    let bestScale = LAYOUT.minScale;

    for (let i = 0; i < 50; i++) {
        const mid = (low + high) / 2;
        const layout = measureSingleRowLayout(cardCount, containerWidth, containerHeight, mid, itemGap);
        if (layout.maxRowWidth <= containerWidth && layout.totalHeight <= containerHeight) {
            bestScale = mid;
            low = mid;
        } else {
            high = mid;
        }
    }

    return bestScale;
}

function getContentLayoutWidth(container) {
    const styles = getComputedStyle(container);
    const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    return Math.max(container.clientWidth - paddingX, 1);
}

function applySingleRowLayout(container, cardCount) {
    if (!container || cardCount <= 0) {
        return { cardWidth: LAYOUT.baseWidth, overlap: LAYOUT.baseOverlap };
    }

    const containerWidth = getContentLayoutWidth(container);
    const containerHeight = Math.max(
        container.clientHeight,
        LAYOUT.baseHeight * LAYOUT.maxScale + LAYOUT.stackGap
    );
    const itemGap = parseFloat(getComputedStyle(container).columnGap || getComputedStyle(container).gap) || LAYOUT.stackGap;
    const scale = findOptimalSingleRowScale(cardCount, containerWidth, containerHeight, itemGap);
    const cardWidth = LAYOUT.baseWidth * scale;
    const cardHeight = LAYOUT.baseHeight * scale;
    const overlap = LAYOUT.baseOverlap * scale;

    container.style.setProperty('--card-width', `${cardWidth}px`);
    container.style.setProperty('--card-height', `${cardHeight}px`);
    container.style.setProperty('--card-overlap', `${overlap}px`);
    container.style.setProperty('--card-container-height', `${cardHeight + 1}px`);
    return { cardWidth, overlap };
}

function getMainDeckLayoutScale() {
    const deckBuilder = document.querySelector('#deckBuilder');
    if (!deckBuilder || !deckOnDeck.length) {
        return 1;
    }

    const cardWidth = parseFloat(getComputedStyle(deckBuilder).getPropertyValue('--card-width'));
    if (cardWidth && !Number.isNaN(cardWidth)) {
        return cardWidth / LAYOUT.baseWidth;
    }

    const deckContent = getDeckContentArea(deckBuilder) || deckBuilder;
    return findOptimalScale(
        getStackCounts(deckOnDeck, 'count'),
        Math.max(deckContent.clientWidth, 1),
        Math.max(deckContent.clientHeight, 1)
    );
}

function applyDeckStackLayout(container, stackCounts, maxScale = null) {
    if (!container) {
        return { cardWidth: LAYOUT.baseWidth, overlap: LAYOUT.baseOverlap };
    }

    if (!stackCounts.length) {
        container.style.setProperty('--card-width', `${LAYOUT.baseWidth}px`);
        container.style.setProperty('--card-height', `${LAYOUT.baseHeight}px`);
        container.style.setProperty('--card-overlap', `${LAYOUT.baseOverlap}px`);
        container.style.setProperty('--card-container-height', `${LAYOUT.baseHeight + 1}px`);
        return { cardWidth: LAYOUT.baseWidth, overlap: LAYOUT.baseOverlap };
    }

    const containerWidth = Math.max(container.clientWidth, 1);
    const containerHeight = Math.max(container.clientHeight, 1);
    let scale = findOptimalScale(stackCounts, containerWidth, containerHeight);
    if (maxScale !== null) {
        scale = Math.min(scale, maxScale);
    }
    const cardWidth = LAYOUT.baseWidth * scale;
    const cardHeight = LAYOUT.baseHeight * scale;
    const overlap = LAYOUT.baseOverlap * scale;

    container.style.setProperty('--card-width', `${cardWidth}px`);
    container.style.setProperty('--card-height', `${cardHeight}px`);
    container.style.setProperty('--card-overlap', `${overlap}px`);
    container.style.setProperty('--card-container-height', `${cardHeight + 1}px`);
    return { cardWidth, overlap };
}

function getLayoutContainer(selector) {
    const panel = document.querySelector(selector);
    if (!panel) {
        return null;
    }
    return panel.querySelector('.floating-card-content') || panel;
}

function getDeckContentArea(panel) {
    if (!panel) {
        return null;
    }
    return panel.querySelector('.floating-card-content') || panel;
}

function syncRandomHandWidth() {
    const deckBuilder = document.querySelector('#deckBuilder');
    const randomHandPanel = document.querySelector('#randomHand');
    if (!deckBuilder || !randomHandPanel) {
        return;
    }
    randomHandPanel.style.width = `${deckBuilder.offsetWidth}px`;
}

function positionSixtyFirstOverSearch(panel) {
    const searchResults = document.querySelector('#searchResults');
    const search = document.querySelector('#search');
    const target = searchResults || search;
    if (!target || !panel) {
        return;
    }
    const rect = target.getBoundingClientRect();
    const maxHeight = Math.max(180, window.innerHeight - rect.top - 16);
    const panelHeight = Math.min(rect.height, maxHeight);
    panel.style.width = `${rect.width}px`;
    panel.style.height = `${panelHeight}px`;
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.transform = 'none';
    panel.style.margin = '0';
}

function centerFloatingPanel(panel) {
    if (!panel) {
        return;
    }
    if (panel.id === 'sixtyFirst') {
        positionSixtyFirstOverSearch(panel);
        return;
    }
    if (panel.id === 'randomHand') {
        syncRandomHandWidth();
    }
    panel.style.transform = 'none';
    panel.style.margin = '0';
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    panel.style.left = `${Math.max(16, (window.innerWidth - width) / 2)}px`;
    panel.style.top = `${Math.max(16, (window.innerHeight - height) / 2)}px`;
}

function hideFloatingPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) {
        return;
    }
    panel.style.display = 'none';

    if (panelId === 'randomHand') {
        activeDiv = 'deck';
        return;
    }
    if (panelId === 'cardsOutsideDeck' || panelId === 'sixtyFirst') {
        activeDiv = 'deck';
    }
}

function showFloatingPanel(panel) {
    if (!panel) {
        return;
    }
    panel.style.display = 'flex';
    requestAnimationFrame(() => centerFloatingPanel(panel));
}

function setupFloatingPanels() {
    document.querySelectorAll('.floating-card-panel').forEach(panel => {
        const handle = panel.querySelector('.panel-drag-handle');
        dragElement(panel, { handle });
    });

    document.querySelectorAll('.panel-close-btn').forEach(button => {
        button.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            hideFloatingPanel(button.dataset.panel);
        });
    });

    const deckBuilder = document.querySelector('#deckBuilder');
    if (typeof ResizeObserver !== 'undefined') {
        if (deckBuilder) {
            const deckWidthObserver = new ResizeObserver(() => {
                const randomHandPanel = document.querySelector('#randomHand');
                if (randomHandPanel?.style.display === 'flex' && randomHand.length) {
                    syncRandomHandWidth();
                    centerFloatingPanel(randomHandPanel);
                    refreshDeckArea('random', randomHand);
                }
            });
            deckWidthObserver.observe(deckBuilder);
        }
        const searchResults = document.querySelector('#searchResults');
        if (searchResults) {
            const searchPanelObserver = new ResizeObserver(() => {
                const sixtyFirstPanel = document.querySelector('#sixtyFirst');
                if (sixtyFirstPanel?.style.display === 'flex') {
                    positionSixtyFirstOverSearch(sixtyFirstPanel);
                    refreshDeckArea('sixtyFirst', sixtyFirstCards);
                }
            });
            searchPanelObserver.observe(searchResults);
        }
    }
}

function setupLayoutObservers() {
    const containers = [
        { element: document.querySelector('#deckBuilder'), populate: () => refreshDeckArea('deck', deckOnDeck) },
        { element: getLayoutContainer('#cardsOutsideDeck'), populate: () => refreshDeckArea('cardsOutsideDeck', cardsOutsideDeck) },
        { element: getLayoutContainer('#sixtyFirst'), populate: () => refreshDeckArea('sixtyFirst', sixtyFirstCards) },
        { element: getLayoutContainer('#randomHand'), populate: () => refreshDeckArea('random', randomHand) },
    ];

    if (typeof ResizeObserver === 'undefined') {
        return;
    }

    const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
            const match = containers.find(item => item.element === entry.target);
            if (match) {
                match.populate();
            }
        });
    });

    containers.forEach(item => {
        if (item.element) {
            observer.observe(item.element);
        }
    });
}

function refreshDeckArea(areaName, activeArray) {
    const previousActiveDiv = activeDiv;
    activeDiv = areaName;
    deckPopulate(activeArray);
    activeDiv = previousActiveDiv;
}


document.addEventListener('DOMContentLoaded', () => {
    loadCards();
    typeChart = new Chart("typeBreakdown", {
        type: 'pie',
        data: {
            labels:chartTypes,
            datasets: [{
                backgroundColor: backgroundColors,
                data: typeCount,
                hoverOffset: 4
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsiveness: true,
            plugins: {
                legend: {
                    // display: false,
                    labels: {
                        filter: function(item, chartData){
                            return chartData.datasets[0].data[item.index] > 0;
                        }
                    }
                    // filter: function(item, chartData) {
                    //     return chartData.data >= 1;
                }
            }     
        },
    });
    typeChart.update();
    document.querySelector('#sortDeckByDestiny').addEventListener('click', () => sortByDestiny());
    document.querySelector('#importDeck').addEventListener('change', () => { importDeck(); });    document.querySelector('#saveDeck').addEventListener('click', () => saveDeck(deckOnDeck));
    document.querySelector('#side').addEventListener('change', () => searchCards());
    document.querySelector('#lsShields').addEventListener('click', () => addShields());
    document.querySelector('#sortDeckByType').addEventListener('click', () => sortDeck());
    document.querySelector('#sortDeckByName').addEventListener('click', () => sortAlphabet());
    document.querySelector('#clearDeck').addEventListener('click', () => clearDeck());
    document.querySelector('#clearSixtyFirst').addEventListener('click', () => clearSixtyFirst());
    initRandomHandControls();
    document.querySelector('#randomHandButton').addEventListener('click', () => randomStartingHand());
    // document.querySelector('#optionOne').addEventListener('change', () => typeFilter(tempDictionary, document.querySelector('#optionOne').value));
    document.querySelector('#optionOne').addEventListener('change', () => typeFilterTest(document.querySelector('#optionOne').value));
    // document.querySelector('#setOption').addEventListener('change', () => setFilter(tempDictionary, document.querySelector('#setOption').value));
    document.querySelector('#setOption').addEventListener('change', () => setFilterTest(document.querySelector('#setOption').value));
    document.querySelector('#icon').addEventListener('change', () => iconFilterTest(document.querySelector('#icon').value));
    // document.querySelector('#textSearchOne').addEventListener('input', () => textFilter(document.querySelector('#searchOneType').value, document.querySelector('#secondaryParameter').value, document.querySelector('#textSearchOne').value));
    document.querySelector('#textSearchOne').addEventListener('input', () => textFilterTest(document.querySelector('#searchOneType').value, document.querySelector('#secondaryParameter').value, document.querySelector('#textSearchOne').value));
    // document.querySelector('#saveParameter').addEventListener('click', () => saveParameters(document.querySelector('#searchOneType').value, document.querySelector('#secondaryParameter').value, document.querySelector('#textSearchOne').value));
    document.querySelector('#secondaryParameter').addEventListener('change', () => textFilterTest(document.querySelector('#searchOneType').value, document.querySelector('#secondaryParameter').value, document.querySelector('#textSearchOne').value));
    document.querySelector('#side').value = "choose";
    document.querySelector('#optionOne').value = "choose";
    document.querySelector('#icon').value = "chooseIcon";
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
    setupLayoutObservers();
    setupFloatingPanels();
    let bars = document.querySelectorAll('.searchBar');
    bars.forEach(bar => {
        bar.value = "";
    });
});

function defensiveShieldTest() {
    var sixtyFirstDiv = document.querySelector('#sixtyFirst');
    var defensiveShieldDiv = document.querySelector('#cardsOutsideDeck');
    if (defensiveShieldDiv.style.display == "flex"){
        defensiveShieldDiv.style.display = "none";
        activeDiv = "deck";
    } else {
        showFloatingPanel(defensiveShieldDiv);
        sixtyFirstDiv.style.display = "none";
        activeDiv = "cardsOutsideDeck";
        if (cardsOutsideDeck.length) {
            refreshDeckArea('cardsOutsideDeck', cardsOutsideDeck);
        }
    };
};

function sixtyFirstTest() {
    var sixtyFirstDiv = document.querySelector('#sixtyFirst');
    var defensiveShieldDiv = document.querySelector('#cardsOutsideDeck');
    if (sixtyFirstDiv.style.display == "flex"){
        sixtyFirstDiv.style.display = "none";
        activeDiv = "deck";
    } else {
        showFloatingPanel(sixtyFirstDiv);
        defensiveShieldDiv.style.display = "none";
        activeDiv = "sixtyFirst";
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

function iconFilterTest(icon){
    currentIcon = icon;
    newSearchArrayTest();
}

function newSearchArrayTest() {
    tempArray = tempDictionary;
    if (currentSearchType != "Null") {
        tempArray = tempArray.filter(card => card.type == currentSearchType);
    }
    if (currentSet != "Null"){
        tempArray = tempArray.filter(card => card.set == currentSet);
    }
    if (currentIcon != "Null"){
        tempArray = tempArray.filter(card => card.icons.includes(currentIcon));
    }
    if (currentSearchQuery != "Null") {
        let property = currentSearchQuery.property;
        let operator = currentSearchQuery.operator;
        let query = currentSearchQuery.query;
        if(currentSearchQuery.operator == "contains") {
            tempArray = tempArray.filter(card => card[property].toLowerCase().includes(query.toLowerCase()));
        } else {
            tempArray = tempArray.filter(card => evaluate(card, property, query, operator));
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
    fetch('load_cards')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load cards (${response.status})`);
            }
            return response.json();
        })
        .then(results => {
            results.forEach(card => {
                const cardName = new cardObject(
                    card['name'],
                    card['gametext'],
                    card['lore'],
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
                    card['icons'],
                    card['imageUrl']
                );
                cardName.isAlternateImage = card['isAlternateImage'] ?? isAlternateImageUrl(card['imageUrl']);
                cardName.isHolographic = false;
                cardName.horizontal = card['subType'] === 'Site';
                if (card['side'] === "Light") {
                    lightDictionary.push(cardName);
                } else {
                    darkDictionary.push(cardName);
                }
            });

            const selectedSide = document.querySelector('#side').value;
            if (selectedSide === "Light" || selectedSide === "Dark") {
                searchCards();
            }
        })
        .catch(error => {
            console.error(error);
            document.querySelector('#resultCount').textContent =
                `Could not load cards: ${error.message}. Ensure the dev server is running and the database has been imported (python manage.py import_cards).`;
        });
};

function searchCards() {
    let cardSide = document.querySelector('#side').value;
    if (cardSide == "Light") {
        searchQuery(lightDictionary);
        tempDictionary = JSON.parse(JSON.stringify(lightDictionary));
        side = 'light';
    } else {
        searchQuery(darkDictionary);
        tempDictionary = JSON.parse(JSON.stringify(darkDictionary));
        side = 'dark';
    };
    newSearchArrayTest();
};

function searchQuery(object) {
    lastSearchResults = object;
    count = 0;
    let resultDiv = document.querySelector('#searchResults');
    resultDiv.innerHTML = "";
    for (const card of object) {
        count++;
        if(count>100) {
            break;
        };
        let name = card.name;
        // let image = card.image;
        // let lore = card.lore;
        let imageUrlTest = card.imageUrl;
        // let imageUrl = image.replace("C:/Users/Jx1/Documents/GitHub/projects/cardSearch/", "");
        // let finalImage = imageUrl.replaceAll('"', '');
        // let gametext = card.gametext;
        // let type = card.type;
        let subType = card.subType;
        // let gempId = card.gempId;
        // let destiny = card.destiny;
        // let power = card.power;
        // let ability = card.ability;
        // let deploy = card.deploy;
        // let forfeit = card.forfeit;
        let resultCard = document.createElement('div');
        resultCard.setAttribute('class', 'card');
        if(isHorizontalCard(card)){
            let rotatedCard = document.createElement('div');
            rotatedCard.classList.add('site-wrapper');
            let imageElement = document.createElement('img');
            imageElement.classList.add('site');
            // imageElement.setAttribute('src', `${finalImage}`);
            imageElement.setAttribute('src', `${imageUrlTest}`);
            imageElement.setAttribute('loading', 'lazy');
            rotatedCard.append(imageElement);
            resultCard.append(rotatedCard);
        } else {
            let imageElement = document.createElement('img');
            // imageElement.setAttribute('src', `${finalImage}`);
            imageElement.setAttribute('src', `${imageUrlTest}`);
            imageElement.setAttribute('loading', 'lazy');
            resultCard.append(imageElement);
        };
        // resultCard.setAttribute('data-type', type);
        // resultCard.setAttribute('id', name);
        // resultCard.setAttribute('data-gametext', gametext);
        // resultCard.setAttribute('data-lore', lore);
        // resultCard.setAttribute('gempId', gempId);
        // resultCard.setAttribute('destiny', destiny);
        resultCard.addEventListener('click', (e) => {
            if(e.shiftKey) {
                // draggableZoom(finalImage, subType)
                draggableZoom(imageUrlTest, isHorizontalCard(card))
            } else {
                if(activeDiv == "deck") {
                    addCard(deckOnDeck, card);
                } else if(activeDiv == "cardsOutsideDeck") {
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
function draggableZoom(imageUrlTest, isHorizontal) {
    var cardDiv = document.getElementById('zoomCard');
    cardDiv.innerHTML = '';
    cardDiv.classList.add("focusCardDiv");
    //add second div that changes the dimensions of the first div, give the movable properties to focusCardDiv, and the dimensions to the next div
    if(isHorizontal) {
        let rotatedCard = document.createElement('div');
        rotatedCard.classList.add('site-wrapper');
        var imageElement = document.createElement('img');
        imageElement.setAttribute("src", `${imageUrlTest}`);
        imageElement.classList.add('focusSite');
        rotatedCard.append(imageElement);
        cardDiv.append(rotatedCard);
    } else {
        var imageElement = document.createElement('img');
        imageElement.setAttribute('src', `${imageUrlTest}`);
        imageElement.classList.add('focusCard');
        cardDiv.append(imageElement);
    };
    cardDiv.style.display = "block";
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
    var type = card.type + "s";
    if (activeArray == deckOnDeck) {
        var position = chartTypes.findIndex(str => type.includes(str));
        typeCount[position] += 1;
    };
    for (i = 0; i < activeArray.length; i++) {
        let tempCard = activeArray[i]
        if(tempCard.name == card.name) {
            if(activeArray == sixtyFirstCards && tempCard.sixtyFirstCount > 0){
                tempCard.sixtyFirstCount += 1;
                newCard = false;
                break;
            } else if (activeArray == deckOnDeck && tempCard.count > 0){
                tempCard.count += 1;
                newCard = false;
                break;
            } else if (activeArray == cardsOutsideDeck && tempCard.outsideCardCount > 0){
                tempCard.outsideCardCount += 1;
                newCard = false;
                break;
            }
        }
        else {
            continue;
        };
    };
    if (newCard) {
        if (activeArray == sixtyFirstCards) {
            card.sixtyFirstCount = 1;
        } else if(activeArray == deckOnDeck) {
            card.count = 1;
        } else if (activeArray == cardsOutsideDeck){
            card.outsideCardCount = 1;
        }
        card.deck = activeDiv;
        // card.deck = activeDiv;
        activeArray.push(card);
    };
    deckPopulate(activeArray);
    typeChart.update();
};

function deckPopulate(activeArray) {
    var deckPanel;
    if(activeDiv == "deck") {
        deckPanel = document.querySelector("#deckBuilder");
    } else if(activeDiv == "sixtyFirst") {
        deckPanel = document.querySelector("#sixtyFirst");
    } else if(activeDiv =="cardsOutsideDeck") {
        deckPanel = document.querySelector('#cardsOutsideDeck');
    } else if(activeDiv == "random") {
        deckPanel = document.querySelector('#randomHand');
    };
    const deckArea = getDeckContentArea(deckPanel);
    if (!deckArea) {
        return;
    }

    let stackCounts = [];
    let countField = 'count';
    if(activeDiv == 'random') {
        stackCounts = activeArray.map(() => 1);
    } else if(activeArray == sixtyFirstCards) {
        stackCounts = getStackCounts(activeArray, 'sixtyFirstCount');
        countField = 'sixtyFirstCount';
    } else if(activeArray == deckOnDeck) {
        stackCounts = getStackCounts(activeArray, 'count');
        countField = 'count';
    } else if(activeArray == cardsOutsideDeck) {
        stackCounts = getStackCounts(activeArray, 'outsideCardCount');
        countField = 'outsideCardCount';
    }

    let layoutValues = { cardWidth: LAYOUT.baseWidth, overlap: LAYOUT.baseOverlap };
    if (deckArea && stackCounts.length) {
        if (activeDiv === 'random') {
            syncRandomHandWidth();
            layoutValues = applySingleRowLayout(deckArea, stackCounts.length);
        } else if (activeDiv === 'sixtyFirst') {
            layoutValues = applyDeckStackLayout(deckArea, stackCounts, getMainDeckLayoutScale());
        } else {
            layoutValues = applyDeckStackLayout(deckArea, stackCounts);
        }
    }

    deckArea.innerHTML = '';
    for(i = 0; i < activeArray.length; i++) {
        let tempCard = activeArray[i];
        let parentContainer = document.createElement("div");
        var parentWidth;
        var cardCount;
        if(activeDiv == 'random') {
            parentWidth = layoutValues.cardWidth;
            cardCount = 1;
        } else if(activeArray == sixtyFirstCards) {
            cardCount = tempCard.sixtyFirstCount;
            parentWidth = layoutValues.cardWidth + (layoutValues.overlap * (cardCount - 1));
        } else if(activeArray == deckOnDeck){
            cardCount = tempCard.count;
            parentWidth = layoutValues.cardWidth + (layoutValues.overlap * (cardCount - 1));
        } else if(activeArray == cardsOutsideDeck) {
            cardCount = tempCard.outsideCardCount;
            parentWidth = layoutValues.cardWidth + (layoutValues.overlap * (cardCount - 1));
        };
        parentContainer.style.width = `${parentWidth}px`;
        parentContainer.classList.add("cardContainer");
        for(j = 0; j < cardCount; j++){ 
            let cardDiv = document.createElement('div');
            if (j > 0) {cardDiv.style.left = `${j * layoutValues.overlap}px`};            //gives card child and deckcard attributes to be controlled by parent container
            cardDiv.classList.add("child", "deckCard", `${activeDiv}`);
            //grabs the image, takes out the path which messes with the image display
            // let imageUrl = tempCard.image.replace("C:/Users/Jx1/Documents/GitHub/projects/cardSearch/", "");
            //removes quotations from the path which also affects the image display
            // let finalImage = imageUrl.replaceAll('"', '');
            let testImageUrl = tempCard.imageUrl;
            //site image generator
            if (isHorizontalCard(activeArray[i])){
                let rotatedCard = document.createElement('div');
                rotatedCard.classList.add('site-wrapper');
                let imageElement = document.createElement('img');
                imageElement.classList.add('deckSite');
                // imageElement.setAttribute('src', `${finalImage}`);
                imageElement.setAttribute('src', `${testImageUrl}`);
                rotatedCard.append(imageElement);
                cardDiv.append(rotatedCard);
                if (j == tempCard.count - 1) {
                    if(tempCard.startingCard) {
                        imageElement.classList.add('starting');
                    };
                };
                cardDiv.addEventListener('click', (e) => {
                    if(e.shiftKey) {
                        draggableZoom(testImageUrl, true)
                        // draggableZoom(finalImage, 'Site')
                    } else if(e.ctrlKey) {
                        if (!tempCard.startingCard && cardDiv.classList.contains('deck')) {
                            imageElement.classList.toggle('starting');
                            tempCard.startingCard = true;
                            deckTotal();
                        } else if (tempCard.startingCard && cardDiv.classList.contains('deck')){
                            imageElement.classList.toggle('starting');
                            tempCard.startingCard = false;
                            deckTotal();
                        };
                    } else {
                        deleteCard(activeArray, tempCard);
                    };
                });
                if(activeDiv == 'random'){
                    j = tempCard.count;
                };
            } else {
                let imageElement = document.createElement('img');
                // imageElement.setAttribute('src', `${finalImage}`);
                imageElement.setAttribute('src', `${testImageUrl}`);
                imageElement.setAttribute('mix-blend-mode', 'multiply');
                cardDiv.append(imageElement);
                if (tempCard.startingCard) {
                    if(j == tempCard.count - 1) {
                        imageElement.classList.add('starting');
                    };
                };
                cardDiv.addEventListener('click', (e) => {
                        if(e.shiftKey) {
                            draggableZoom(testImageUrl, isHorizontalCard(tempCard))
                            // draggableZoom(finalImage, tempCard.subType)
                        } else if(e.ctrlKey) {
                            if (!tempCard.startingCard && cardDiv.classList.contains('deck')) {
                                imageElement.classList.toggle('starting');
                                tempCard.startingCard = true;
                                deckTotal();
                            } else if (tempCard.startingCard && cardDiv.classList.contains('deck')) {
                                imageElement.classList.toggle('starting');
                                tempCard.startingCard = false;
                                deckTotal();
                            };
                        } else {
                            deleteCard(activeArray, tempCard);   
                        };
                    });
                if(activeDiv == 'random'){
                    j = tempCard.count;
                };
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
    var deckTotalMinusStarting = getDeckTotal;
    let deckCount = document.querySelector('#deckCount');
    let deckAverageDestiny = document.querySelector('#averageDestiny');
    var totalDestiny = 0;
    for (i = 0; i < deckOnDeck.length; i++) {
        let startingNumber = 0;
        if(deckOnDeck[i].startingCard) {
            startingNumber += 1;
            deckTotalMinusStarting -= 1;
        }
        if (deckOnDeck[i].destiny.includes('or')) {
            const lastNumber = deckOnDeck[i].destiny.split('or').pop().trim();
            deckOnDeck[i].destiny = lastNumber;
        }
        totalDestiny += deckOnDeck[i].destiny * (deckOnDeck[i].count - startingNumber);
    };
    let destinyAverage = totalDestiny / deckTotalMinusStarting;
    deckCount.innerHTML = `${getDeckTotal}`;
    deckAverageDestiny.innerHTML = `${destinyAverage.toFixed(2)}`;
};


//stoppage june 9th, figure out delete card too tired
function deleteCard(activeArray, card){
    let tempDiv = activeDiv;
    if(activeArray == deckOnDeck) {
        card.count -= 1;
        if (card.count == 0) {
            let tempIndex = activeArray.indexOf(card);
            activeArray.splice(tempIndex, 1);
        };
        var type = card.type + "s";
        var position = chartTypes.findIndex(str => type.includes(str));
        typeCount[position] -= 1;
        if (activeDiv == "sixtyFirst") {
            addCard(sixtyFirstCards, card);
        }
    } else if (activeArray == sixtyFirstCards) {
        card.sixtyFirstCount -= 1;
        if (card.sixtyFirstCount == 0) {
            let tempIndex = activeArray.indexOf(card);
            activeArray.splice(tempIndex, 1);
        };
        addCard(deckOnDeck, card);
    } else if (activeArray == cardsOutsideDeck) {
        card.outsideCardCount -= 1;
        if (card.outsideCardCount == 0) {
            let tempIndex = activeArray.indexOf(card);
            activeArray.splice(tempIndex, 1);
        };
    };
    activeDiv = 'cardsOutsideDeck';
    deckPopulate(cardsOutsideDeck);
    activeDiv = 'deck';
    deckPopulate(deckOnDeck);
    activeDiv = 'sixtyFirst';
    deckPopulate(sixtyFirstCards);
    activeDiv = 'random';
    deckPopulate(randomHand)
    typeChart.update();
    activeDiv = tempDiv;
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
function dragElement(elmnt, options = {}) {
    const handle = options.handle || elmnt;
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;

    handle.onmousedown = dragMouseDown;

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
        elmnt.style.top = `${elmnt.offsetTop - pos2}px`;
        elmnt.style.left = `${elmnt.offsetLeft - pos1}px`;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
};

function saveDeck(deckOnDeck) {
    let deckList = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>` + `\n` + `<deck>`;
    deckList = deckList + `\n`;
    for (i = 0; i < deckOnDeck.length; i++){
        let tempCard = deckOnDeck[i].name;
        tempCard = replaceString(tempCard);
        const blueprintId = deckOnDeck[i].isHolographic
            ? `${deckOnDeck[i].gempId}*`
            : deckOnDeck[i].gempId;
        deckList = deckList + `    <card blueprintId="${blueprintId}" title="${tempCard}"/>\n`.repeat(deckOnDeck[i].count);
    };    deckList = deckList + "</deck>";
    //june 3rd stoppage
    let deckName = prompt("Save deck list as: ");
    if (deckName) {
        let newDeck = new File([`${deckList}`], `${deckName}.txt`);
        downloadDeck(newDeck);
    };
    let title = document.querySelector('#deckTitle')
    title.textContent = deckName;
};

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

function importDeckEntries(entries, targetArray, dictionary, areaName) {
    const previousActiveDiv = activeDiv;
    activeDiv = areaName;
    const missing = [];

    entries.forEach(entry => {
        const resolvedCard = resolveCard(entry.blueprintId, entry.title, dictionary);
        if (!resolvedCard) {
            missing.push(entry.title || entry.blueprintId);
            return;
        }
        if (entry.horizontal) {
            resolvedCard.horizontal = true;
        }
        addCard(targetArray, resolvedCard);
    });

    activeDiv = previousActiveDiv;
    return missing;
}

function importDeck() {
    const sixtyFirstDiv = document.querySelector('#sixtyFirst');
    const defensiveShieldDiv = document.querySelector('#cardsOutsideDeck');
    const deckTitle = document.querySelector('#deckTitle');
    const sideSelect = document.querySelector('#side');
    const importInput = document.querySelector('#importDeck');

    if (importInput.files.length === 0) {
        return;
    }

    const importedDeck = importInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsedDeck = parseDeckXml(e.target.result);
            const allEntries = parsedDeck.main.concat(parsedDeck.outside);
            const detectedSide = detectDeckSide(allEntries);

            if (!detectedSide) {
                alert('Could not determine deck side. Check that cards exist in the database.');
                importInput.value = '';
                return;
            }

            const dictionary = detectedSide === 'Light' ? lightDictionary : darkDictionary;
            sideSelect.value = detectedSide;
            searchCards();

            deckOnDeck = [];
            cardsOutsideDeck = [];
            sixtyFirstCards = [];
            for (let i = 0; i < typeCount.length; i++) {
                typeCount[i] = 0;
            }

            sixtyFirstDiv.style.display = 'none';
            defensiveShieldDiv.style.display = 'none';
            activeDiv = 'deck';

            let titleCleaned = importedDeck.name.replace(/\.(txt|html)$/i, '');
            deckTitle.textContent = titleCleaned;

            const missingMain = importDeckEntries(parsedDeck.main, deckOnDeck, dictionary, 'deck');
            const missingOutside = importDeckEntries(parsedDeck.outside, cardsOutsideDeck, dictionary, 'cardsOutsideDeck');

            activeDiv = 'deck';
            deckPopulate(deckOnDeck);

            const missing = missingMain.concat(missingOutside);
            if (missing.length) {
                alert(`Imported ${detectedSide} deck with ${missing.length} unmatched card(s):\n${missing.slice(0, 5).join('\n')}`);
            }

            typeChart.update();
            deckTotal();
            importInput.value = '';
        } catch (error) {
            alert(error.message || error);
            importInput.value = '';
        }
    };
    reader.onerror = () => alert('Could not read deck file.');
    reader.readAsText(importedDeck);
}
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

function sortByDestiny() {
    deckOnDeck.sort((a, b) => a.destiny - b.destiny);
    deckPopulate(deckOnDeck);
};


function sortDeck() {
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
    tempDiv = activeDiv;
    activeDiv = 'deck';
    deckPopulate(deckOnDeck);
    activeDiv = tempDiv;
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
    tempDiv = activeDiv;
    activeDiv = 'deck';
    deckPopulate(deckOnDeck);
    activeDiv = tempDiv;
};

async function addShields() {
    activeDiv = "cardsOutsideDeck";
    const shieldPanel = document.querySelector('#cardsOutsideDeck');
    const shieldArea = getDeckContentArea(shieldPanel);
    if (cardsOutsideDeck.length > 0) {
        cardsOutsideDeck = [];
        if (shieldArea) {
            shieldArea.innerHTML = '';
        }
        return;
    }

    const deckSide = document.querySelector('#side').value;
    if (deckSide !== 'Light' && deckSide !== 'Dark') {
        alert('Choose a side before loading defensive shields.');
        return;
    }

    const dictionary = deckSide === 'Light' ? lightDictionary : darkDictionary;
    const shieldButton = document.querySelector('#lsShields');
    const previousLabel = shieldButton.textContent;
    shieldButton.textContent = 'Loading shields...';
    shieldButton.disabled = true;

    try {
        const entries = await fetchGempShields(deckSide);
        const shields = [];
        const missing = [];

        entries.forEach(entry => {
            const resolvedCard = resolveCard(entry.blueprintId, '', dictionary);
            if (!resolvedCard) {
                missing.push(entry.blueprintId);
                return;
            }
            if (entry.horizontal) {
                resolvedCard.horizontal = true;
            }
            const copy = JSON.parse(JSON.stringify(resolvedCard));
            copy.outsideCardCount = 1;
            shields.push(copy);
        });

        cardsOutsideDeck = shields;
        showFloatingPanel(shieldPanel);
        deckPopulate(cardsOutsideDeck);
        centerFloatingPanel(shieldPanel);

        if (missing.length) {
            console.warn(`Could not resolve ${missing.length} GEMP shield(s):`, missing);
        }
    } catch (error) {
        alert(`Could not load shields from GEMP: ${error.message}`);
    } finally {
        shieldButton.textContent = previousLabel;
        shieldButton.disabled = false;
    }
};

function clearDeck() {
    let deckArea = document.querySelector('#deckBuilder');
    deckOnDeck = [];
    deckArea.innerHTML = '';
    for(i=0;i<typeCount.length;i++){
        typeCount[i] = 0;
    };
    typeChart.update();
    deckTotal();
    let deckTitle = document.querySelector('#deckTitle');
    deckTitle.textContent = 'New Deck';
};

function clearSixtyFirst() {
    const deckArea = getDeckContentArea(document.querySelector('#sixtyFirst'));
    sixtyFirstCards = [];
    if (deckArea) {
        deckArea.innerHTML = '';
    }
}

function initRandomHandControls() {
    document.querySelectorAll('.hand-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.hand-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            randomHandSize = parseInt(btn.dataset.size, 10);
        });
    });
}

function buildDeckPool(deckCards) {
    const pool = [];
    const eligible = deckCards.filter(card => !card.startingCard);
    for (let i = 0; i < eligible.length; i++) {
        const copies = eligible[i].count > 0 ? eligible[i].count : 1;
        for (let j = 0; j < copies; j++) {
            pool.push(eligible[i]);
        }
    }
    return pool;
}

function updateRandomHandTitle(drawCount) {
    const title = document.querySelector('#randomHand .panel-drag-title');
    if (title) {
        title.textContent = `Random Hand (${drawCount})`;
    }
}

function randomStartingHand() {
    const randomHandDiv = document.querySelector('#randomHand');
    const pool = buildDeckPool(deckOnDeck);

    if (!pool.length) {
        alert('Add cards to your deck first.');
        return;
    }

    const drawCount = Math.min(randomHandSize, pool.length);
    const temp = pool.slice();
    randomHand = [];

    for (let i = 0; i < drawCount; i++) {
        const randomCard = Math.floor(Math.random() * temp.length);
        randomHand.push(temp[randomCard]);
        temp.splice(randomCard, 1);
    }

    activeDiv = 'random';
    showFloatingPanel(randomHandDiv);
    deckPopulate(randomHand);
    updateRandomHandTitle(drawCount);
    centerFloatingPanel(randomHandDiv);
}

function replaceString(tempCard) {
    tempCard = tempCard.replace("â€¢", "");
    tempCard = tempCard.replace("â€¢", "");
    tempCard = tempCard.replace("â€¢", "");
    tempCard = tempCard.replace("<>", "");
    tempCard = tempCard.replace("<>", "");
    tempCard = tempCard.replace("<>", "");
    tempCard = tempCard.replace(" (V)", "");
    tempCard = tempCard.replace(" (AI)", "");
    var temp = tempCard.split(" / ");
    tempCard = temp[0];
    // tempCard = tempCard.trim();
    tempCard = tempCard.replace('&', '&amp;');
    return tempCard;
};