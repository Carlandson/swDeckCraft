from django.db import models
from django.contrib.postgres.fields import ArrayField
from rest_framework import routers, serializers, viewsets
import json

class starwarscard(models.Model):
    title = models.CharField(max_length=200, null=True, default="")
    type = models.CharField(max_length=200, null=True, default="")
    side = models.CharField(max_length=200, null=True, default="")
    gametext = models.TextField(max_length=200, null=True, default="")
    deploy = models.CharField(max_length=200, default="")
    characteristics = models.CharField(max_length=200, null=True, default="")
    destiny = models.CharField(max_length=200, null=True, default="")
    forfeit = models.CharField(max_length=200, null=True, default="")
    icons = ArrayField(models.CharField(max_length=200, blank=True, default=""),default=list, null=True)
    imageUrl = models.URLField(max_length=200, null=True, default="")
    lore = models.TextField(max_length=200, null=True, default="")
    power = models.CharField(max_length=200, null=True, default="")
    subType = models.CharField(max_length=200, null=True, default="")
    gempId = models.CharField(max_length=200, null=True, default="")
    id = models.IntegerField(primary_key=True)
    set = models.CharField(max_length=200, null=True, default="")
    rarity = models.CharField(max_length=200, null=True, default="")
    conceptBy = models.TextField(max_length=200, null=True, default="")
    legacy = models.BooleanField(max_length=200, null=True, default="")
    extraText = ArrayField(models.CharField(max_length=200, null=True, default=""), default=list, null=True)
    uniqueness = models.CharField(max_length=200, null=True, default="")
    armor = models.CharField(max_length=200, null=True, default="")
    errataVersion = models.CharField(max_length=200, null=True, default="")
    sourceType = models.CharField(max_length=200, null=True, default="")
    landspeed = models.CharField(max_length=200, null=True, default="")
    ability = models.CharField(max_length=200, null=True, default="")
    hyperspeed = models.CharField(max_length=200, null=True, default="")
    maneuver = models.CharField(max_length=200, null=True, default="")
    politics = models.CharField(max_length=200, null=True, default="")
    parsec = models.CharField(max_length=200, null=True, default="")
    lightSideIcons = models.IntegerField(null=True)
    darkSideIcons = models.IntegerField(null=True)
    ferocity = models.CharField(max_length=200, null=True, default="")
    destinyValues = ArrayField(models.CharField(max_length=200, null=True, default=""), default=list, null=True)
    image = models.ImageField(upload_to='', max_length=255, blank=True)
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