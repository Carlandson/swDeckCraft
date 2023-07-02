from django.contrib import admin

from .models import starwarscard, decklist, copies


admin.site.register(decklist)
admin.site.register(copies)

class starwarscardAdmin(admin.ModelAdmin) :
    search_fields = ["title", "image"]

search_fields = ('title', 'image')

admin.site.register(starwarscard, starwarscardAdmin)