
# Capstone Project - Restaurant Menu Builder and Finder

A project to help restaurants quickly connect to their patrons.

## Distinctiveness and Complexity

Local Eats is a website that helps restaurant owners quickly create menus and quickly connects people to restaurants they will love. It is distinct in that it provides users the ability to rate dishes and populate lists to find specific food they want to eat.

Local Eats is not a social networking site because it provides services to guests in both creating a restaurant page and allowing anyone to find and browse different restaurants near them, rather than connecting and sharing content between.

Local Eats is not an e-commerce site, because it does not sell anything. It is a restaurant menu builder and discovery service.

There are functions to populate star ratings for dishes based on an average rating system obtain from https://pypi.org/project/django-star-ratings/, location discovery using both google maps api and geopy, and a countries field created by #https://github.com/SmileyChris/django-countries/.

### Python Functions

In the views file I have numerous functions we've learned from cs50w, as well as new functions I've created using knowledge obtained from the course.

**register, login, logout**

These are functions we've learned and were mostly provided for us I've adopted for my website.

**profile**

Populates a profile page with a list of owned restaurants.

**create**

Using modelforms from django, a method I discovered in a previous project, I easily populated a form for the user to create a restaurant.

**eatery**

This function populates each restaurant page and the top rated dishes at that particular restaurant. Understanding how the star ratings system worked was somewhat tricky, it involves some model functionality we never learned. This function also helps distinguish between an patron and the owner of the restaurant.

**new_dish**

A function to add a new dish to your menu, which is populated in collapsible dividers for the user to see the price and description, as well as rate the dish.

**add_course**

Adds a course from a list I created to your restaurant, to organize your restaurant's dishes.

**add_dish**

Recieves information from a javascript file to save information from a form on the eatery page about a new dish. API routes and JSON were learned and utilized from the last two projects.

**search**

Using javascript geolocation, I created a list that is populated based on distances and geolocation of the user's ip.  You can choose walk, bike, or drive, which are at relatively 2 miles, 5 miles, and 15 miles away, to populate a list of restaurants near you.

**filter**

This is for the index page, to filter based on a user's search for a specific city.

**edit_dish, delete_dish, delete course**

Basic functionality for javascript to edit and delete dishes and courses.

### JavaScript files

**index.js**

This file provides functionality for the geolocation search function on the main page, as well as the filter function for discovering restaurants in different cities.

**menubuilder.js**

Functions for adding new courses and dishes, as well as editing and deleting dishes. Much of this was learned through the mail project, as well as a few different clever ways of providing lists unique event handlers. Because I wanted to be able to edit each individual dish without a new page, I used similar code to how I edited a post in the network project. by providing each class name a unique event based on its id created by django templating, I provided the user a no hassle way to manipulate their menu information.

### HTML files

Tailwind and bootsrap were used for styling these pages and making them mobile responsive.

### How to run the application

Launching the application you can jump right in, creating new restaurants after you've registered to the site! It does not pull data about restaurants from google maps, so new restaurant creation is vital to the use of the website.