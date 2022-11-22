from django.contrib import admin

from .models import starwarscard, decklist, copies


admin.site.register(starwarscard)
admin.site.register(decklist)
admin.site.register(copies)
