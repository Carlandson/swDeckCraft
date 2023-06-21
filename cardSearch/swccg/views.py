import json
from django.http import HttpResponse
from django.shortcuts import render
from .models import starwarscard, decklist, copies
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
import requests
import urllib3
import os
import urllib.request
from django.core.files import File
import re

def index(request):
    decks = decklist.objects.all().order_by("-id")
    return render(request, 'swccg/index.html', {'decklists': decks})

#saving function to display method for injecting card data into sql, use later if needed
#when new cards are created. could also be used to add values to cards.

#Note - I found errors in these lists so saving this was incredibly helpful!
# def card_save(request):
#     if request.method == "POST":
#         with open('/workspaces/73307697/final/swccg/lscardlist.txt') as f:
#             lines = f.readlines()
#             defensive = "Defensive"
#             epic = "Epic"
#             admiral = "Admiral's"
#             for line in lines:
#                 cardtype = line.split()[0]
#                 if cardtype in (defensive, epic, admiral):
#                     y = line.split()[1]
#                     cardtype = cardtype + " " + y
#                 if cardtype == "Jedi":
#                     second = line.split()[1]
#                     third = line.split()[2]
#                     cardtype = cardtype + " " + second + " " + third
#                 type = card_type.objects.get(types = cardtype)
#                 dark = forceside.objects.get(sides="Light")
#                 card = line.replace(cardtype, "")
#                 card = card.lstrip()
#                 card = card.rstrip()
#                 newcard = starwarscard(
#                     name = card,
#                     type = type,
#                     side = dark,
#                     pk = None,
#                 )
#                 newcard.save()
#         return render(request, 'swccg/card_save.html')
    # return render(request, 'swccg/card_save.html')

# saved cards 
# def card_save(request):
#     if request.method == "POST":
#         data = open('swccg\Light.json').read()
#         json_data = json.loads(data)
#         keys = {}
#         for d in json_data["cards"]:
#             cardAttribute = {}
#             for first_key, value in d.items():
#                 if first_key == "printings":
#                     continue
#                 if type(value) == list:
#                     continue
#                 if first_key != "front" and first_key != "back" and first_key != "counterpart":
#                     cardAttribute[first_key] = value
#                 if type(value) == dict and first_key != "back":
#                     for second_key, second_value in value.items():
#                         # print(second_key)
#                         # print(second_value)
#                         if second_key == int or bool or str:
#                             cardAttribute[second_key] = second_value
#                         else:
#                             if second_key == "icons" or  second_key == "destinyValues":
#                                 cardAttribute[second_key] = []
#                                 for item in second_value:
#                                     if type(item) == str or int or bool:
#                                         cardAttribute[second_key].append(item) 
#                             else:
#                                 continue
#             m = starwarscard(**cardAttribute)
#             m.save()
#         return render(request, 'swccg/card_save.html', {"keys" : keys})
#     if request.method == "GET":
#         return render(request, 'swccg/card_save.html')
# This adds images to the database, because accessing the url was too slow
def card_save(request):
#     if request.method == "POST":
#         card_db = starwarscard.objects.all();
#         for card in card_db:
#             url = card.imageUrl
#             card_title_cleaned = re.sub('[?<>]', '', card.title)
#             if '/' in card_title_cleaned:
#                 card_split = card_title_cleaned.rsplit('/', 1)[0]
#                 card_name = card_split.strip() + ".jpg"
#             else:
#                 card_name = card_title_cleaned + ".jpg"
#             save_path = "C:/Users/Jx1/Documents/GitHub/projects/cardSearch/media/MEDIA/images"
#             join_path_image = os.path.join(save_path, card_name)
#             if card.imageUrl and not card.image:
#                 with open(join_path_image, 'wb') as handle:
#                     response = requests.get(url, stream=True)
#                     if not response.ok:
#                         print(response)
#                     for block in response.iter_content(1024):
#                         if not block:
#                             break
#                         handle.write(block)
#                     card.image = join_path_image
#                     card.save()
        # if test_card.imageUrl and not test_card.image:
        #     result = urllib.request.urlretrieve(url, "MEDIA/images")
        #     print(result)
        #     test_card.image.save(
        #         os.path.basename(test_card.imageUrl),
        #         File(open(result[0], encoding="utf8"))
        #     )
        #     test_card.save()
    #     return render(request, 'swccg/card_save.html')
    if request.method == "GET":
        return render(request, 'swccg/card_save.html')
    # for card in card_db:
    #     img_data = requests.get(card.imageUrl)


@csrf_exempt
def deckbuild(request):
    if request.method == "GET":
        cards = starwarscard.objects.all()
    return render(request, 'swccg/deckbuild.html', {"cards" : cards})

def deckview(request, deckid):
    if request.method == "GET":
        deck_choice = decklist.objects.get(id=deckid)
        deck_cards = copies.objects.all()
        deck_type_dict = dict()
        deck_types = card_type.objects.all().order_by("types")
        for each in deck_types:
            title = each.types
            deck_type_dict[title] = []
        my_list = []
        my_cards = deck_choice.deck_list.filter(deck_list=deck_choice).order_by("name")
        for card in my_cards:
            add_card = starwarscard.objects.get(name = card.name, side=deck_choice.side)
            my_list.append(add_card)
        for list in deck_type_dict.copy():
            count = 0;
            for item in my_list:
                card_type_is = item.type.types
                if card_type_is == list:
                    deck_type_dict[list].append(item)
                    count +=1
            if count == 0:
                deck_type_dict.pop(list)
        return render(request, 'swccg/deckview.html', {"deck": deck_choice, "cards":my_list, "type_lists":deck_type_dict})
        
#fetch all cards return an array
def load_cards(request):
    if request.method == "GET":
        all_cards = starwarscard.objects.all()
        return JsonResponse([cards.serialize() for cards in all_cards], safe=False)

def card_search(request, cardside):
    if request.method == "GET":
        #if no cards return results = 0
        side = starwarscard.objects.filter(side=cardside)
        return JsonResponse([card_list.serialize() for card_list in side], safe=False)

#saving this, it will be incoprorated when we get decklist sharing functionality
# @csrf_exempt
# def deck_build(request):
#     if request.method == "POST":
#         data = json.loads(request.body)
#         name = data.get("name", "")
#         author = data.get("author", "")
#         cards = data.get("cards", "")
#         side = data.get("side", "")
#         force_side = forceside.objects.get(sides=side)
#         new_deck = decklist(
#             name = name,
#             author = author,
#             side = force_side
#         )
#         new_deck.save()
#         for card in cards:
#             object_translate = starwarscard.objects.get(name=card, side=force_side)
#             copies.objects.create(name=object_translate, deck_list=new_deck)
#         return JsonResponse({"message" : "deck saved."}, status=201)
#     if request.method == "GET":
#         pass
# this is going to just output a txt file of deck, for now
# @csrf_exempt
# def deck_build(request):
#     if request.method == "POST":
#         data = json.loads(request.body)
#         name = data.get("name", "")
#         cards = data.get("cards", "")
#         side = data.get("side", "")
#         for card in cards:
#             object_translate = starwarscard.objects.get(name=card, side=force_side)
#             copies.objects.create(name=object_translate, deck_list=new_deck)
#         return JsonResponse({"message" : "deck saved."}, status=201)
#     if request.method == "GET":
#         pass


def deck_check(request, deckname):
    if request.method != "GET":
        return JsonResponse({"error" : "GET request required."}, status=400)
    if decklist.objects.filter(name=deckname).exists():
        #decklist_exists = True
        return JsonResponse(True, safe=False)
    else:
        #decklist_exists = False
        return JsonResponse(False, safe=False)

def index_search(request, parameter):
    if request.method != "GET":
        return JsonResponse({"error" : "GET request required."}, status=400)
    deck_results = decklist.objects.filter(Q(name__icontains = parameter) | Q(author__icontains=parameter))
    return JsonResponse([decks.serialize() for decks in deck_results], safe=False)