from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('card_save', views.card_save, name='card_save'),
    path('deckbuild', views.deckbuild, name='deckbuild'),
    path('deckview/<str:deckid>', views.deckview, name='deckview'),
    path('card_search/<str:cardside>/', views.card_search, name='card_search'),
    # path('deck_build', views.deck_build, name="deck_build"),
    path('deck_check/<str:deckname>', views.deck_check, name="deck_check"),
    path('index_search/<str:parameter>', views.index_search, name="index_search"),
    path('load_cards', views.load_cards, name='load_cards'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)