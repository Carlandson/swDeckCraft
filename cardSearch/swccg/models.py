from django.db import models
from django.contrib.postgres.fields import ArrayField
from rest_framework import routers, serializers, viewsets
import json

class starwarscard(models.Model):
    title = models.CharField(max_length=200, null=True, default="", blank=True)
    type = models.CharField(max_length=200, null=True, default="", blank=True)
    errataSymbol = models.CharField(max_length=200, null=True, default='', blank=True)
    errataDate = models.CharField(max_length=200, null=True, default='', blank=True)
    errataNotes = models.TextField(max_length=10000, null=True, default='', blank=True)
    previousId = models.CharField(max_length=200, null=True, default="", blank=True)
    side = models.CharField(max_length=200, null=True, default="", blank=True)
    gametext = models.TextField(max_length=200, null=True, default="", blank=True)
    deploy = models.CharField(max_length=200, default="", blank=True)
    characteristics = models.CharField(max_length=200, null=True, default="", blank=True)
    destiny = models.CharField(max_length=200, null=True, default="", blank=True)
    forfeit = models.CharField(max_length=200, null=True, default="", blank=True)
    icons = ArrayField(models.CharField(max_length=200, blank=True, default=""),default=list, null=True, blank=True)
    imageUrl = models.URLField(max_length=200, null=True, default="", blank=True)
    lore = models.TextField(max_length=200, null=True, default="", blank=True)
    power = models.CharField(max_length=200, null=True, default="", blank=True)
    subType = models.CharField(max_length=200, null=True, default="", blank=True)
    gempId = models.CharField(max_length=200, null=True, default="", blank=True)
    id = models.IntegerField(primary_key=True, blank=True)
    set = models.CharField(max_length=200, null=True, default="", blank=True)
    rarity = models.CharField(max_length=200, null=True, default="", blank=True)
    conceptBy = models.TextField(max_length=200, null=True, default="", blank=True)
    legacy = models.BooleanField(max_length=200, null=True, default="", blank=True)
    extraText = ArrayField(models.CharField(max_length=200, null=True, default=""), default=list, null=True, blank=True)
    uniqueness = models.CharField(max_length=200, null=True, default="", blank=True)
    armor = models.CharField(max_length=200, null=True, default="", blank=True)
    errataVersion = models.CharField(max_length=200, null=True, default="", blank=True)
    sourceType = models.CharField(max_length=200, null=True, default="", blank=True)
    landspeed = models.CharField(max_length=200, null=True, default="", blank=True)
    ability = models.CharField(max_length=200, null=True, default="", blank=True)
    hyperspeed = models.CharField(max_length=200, null=True, default="", blank=True)
    maneuver = models.CharField(max_length=200, null=True, default="", blank=True)
    politics = models.CharField(max_length=200, null=True, default="", blank=True)
    parsec = models.CharField(max_length=200, null=True, default="", blank=True)
    lightSideIcons = models.IntegerField(null=True, blank=True)
    darkSideIcons = models.IntegerField(null=True, blank=True)
    ferocity = models.CharField(max_length=200, null=True, default="", blank=True)
    destinyValues = ArrayField(models.CharField(max_length=200, null=True, default=""), default=list, null=True, blank=True)
    image = models.ImageField(upload_to='', max_length=255, blank=True)
    backSideImage = models.ImageField(upload_to='', max_length=255, blank=True)
    def __str__(self):
        return f"{self.title}"

    def serialize(self):
        return {
            "name" : self.title,
            "type" : self.type,
            "side" : self.side,
            "gametext" : self.gametext,
            "image" : json.dumps(str(self.image), ensure_ascii=False),
            "lore" : self.lore,
            "subType" : self.subType,
            "gempId" : self.gempId,
            "destiny" : self.destiny,
            "ability" : self.ability,
            "power" : self.power,
            "deploy" : self.deploy,
            "forfeit" : self.forfeit,
            "set" : self.set,
        }

class decklist(models.Model):
    name = models.CharField(max_length=200)
    author = models.CharField(max_length=200, default="")
    card = models.ManyToManyField(starwarscard, through="copies")
    side = models.CharField(max_length=200)


    def __str__(self):
        return f"{self.name} by {self.author}"

    def serialize(self):
        return {
            "name" : self.name,
            "author" : self.author,
            "side" : self.side,
            "id" : self.id
        }

#intermediary model to add multiple instances of a card

class copies(models.Model):
    name = models.ForeignKey(starwarscard, on_delete=models.CASCADE, related_name="cardname")
    deck_list = models.ForeignKey(decklist, on_delete=models.CASCADE, default="",related_name="deck_list")

    def __str__(self):
        return f"{self.name} in {self.deck_list}"