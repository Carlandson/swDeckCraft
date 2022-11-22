#Star Wars Cards Database and Deckbuilder

# Video Demo : TODO

#### Description :

Star Wars Deck Builder is a website designed to search through a database of cards for the game Star Wars CCG and allow you and other users to build and share decks. It is broken down into three pages; index, deckbuild and deckview. The index page has a link to the deckbuilder and a list of 10 recent decks built by other users, as well as a searchbar to find decks. The deckbuild page allows users to search through the database and create a deck to be submitted to the database. When you follow a link to a deck on index, it breaks the deck down into smaller parts based on what type of cards are in the deck on the deckview page. This project uses the Django Framework, with python for database queries and javascript for client-side search functions.

## Python files :

Many of these files are part of the django framework and are created automatically using the template given by a tutorial on Django's website. The files I worked on were models.py, views.py, and urls.py.

### models.py :

I created 5 models to organize my database of cards:

##### 1.forceside
A simple field "sides" to designate the two different main types of cards in the star wars card game. def __str_(self): returns a string of each object when called, helpful and necessary for manipulating information in the admin page.

##### 2.card_type
Another simple field with a list of all the types of cards in Star Wars ccg.

##### 3.starwarscard
Contains 3 fields: name, type, and side. Name is a character field, important to note that it cannot be a textfield because there are symbols in the card name. type is a foreign key relation to forceside, and side is a foreignkey relation to card_type.
I serialized these fields for API routing to use JSON communication between javascript and python.

##### 4.decklist
Contains 4 fields: name, author, card, and side. Name is a character field to title the deck. Author is for the creator of the deck. Card is a M2M field related to the starwarscard model through an intermediary "copies" in order to allow multiple versions of each card in the deck. Side is a foreignkey field connected to forceside.

### views.py

These are the main functions of the website.

##### 1.card_save

I saved two text files to my folder that are manipulated by this function to save cards into the starwarscard field. I saved the database first from https://scomp.starwarsccg.org/, imported it into a spreadsheets page and organized the cards by side and by type first, card name second. This function reads each line (f.readlines()) looks for the first word (or adds a second or two based on the first word), splits the line and and strips the spaces, then saves the type, name, and side into my starwarscard model. I used an html page to submit these, and they are hidden in the files for future use.

##### 2.deckbuild

Function to get the deckbuild page, populates two select forms "type" and "side" for search queries.

##### 3.deckview

This function queries the database for the particular deck the user has picked. It grabs the decklist, then creates a list of dictionaries to populate each type of card in the deck so we can see the deck organized by type. Its organized alphabetically by type and then by card name using order_by(). It also creates a copy of the listed dictionaries in order to remove empty dictionaries in case not every type is represented.

##### 4.card_search

A function to parse the database for cards based on the user's parameters. It takes in 4 different variables and uses those to find all objects that match those requirements, and returns a serialized list to the javascript. Also added an "all" if statement for user to find matches without designating type.

##### 5.deck_build

Deck_build posts the card choices a user has inputed into the deckbuild page, and saves the deck. It recieves a jsonified file "data" and uses data.get to grab the value of each key, saving them as their respective fields. For the foreign key relationship we create an object that matches the side to the actual forceside object, then the function saves the deck and copies all of the cards into the relational through model "copies".

##### 6.deck_check

This is a simple function to prevent the user from creating a deck that has the same name as one that already exists. It simply returns false or true to a javascript function.

##### 7.index_search

Simple search for index page that returns all matching results. Also uses objects jsonified.

### urls.py

Paths for various API and HTML routing.

## Javascript files

Javascript was used to provide asynchronous updates to both the index page for searching the deck database, as well as for various functions on the deckbuild page.

### Deckbuild.js

There are 2 main event listeners on content load: searchCards, and build deck. a Third event listener handles changing the background depending on what side the user picks.

##### searchCards

This function handles the event of submitting a query to find cards in the database. It takes the side and type values and a query on submit and uses a path to send the data to a python function, which parses the database for matching results.  It then generates divs for each card, and changes the innerhtml to represent the card, adds another event listener addCard to add to the deck construction box, and appends the div into the resultDiv.

##### addCard and deleteCard

Simple add and remove cards to and from the deck construction box.

##### deckTotal

Checks to make sure before submitting the deck total, which in this particular game is required to be 60, and doesn't allow the user to submit if its not exactly 60.

##### buildDeck

This function first fetches the title from the deck_check path to make sure a duplicate deck name isn't created. If it is new, fetches the deck_build path and posts the name, author, cards, and side to the deck_build function, which saves the new deck as a decklist model. Then an alert, followed by a redirect to the main page.

##### searchDecks via Index.js

This is a very similar function to searchCards, just populates the index page when a search query is made.

## HTML files:

Tailwind is used for most of the styling, and django templating to populate some lists. The layout is not utilized much, mostly to extend the header onto each page.




