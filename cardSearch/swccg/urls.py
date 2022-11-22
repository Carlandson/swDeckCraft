from django.urls import path, include

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('card_save', views.card_save, name='card_save'),
    path('deckbuild', views.deckbuild, name='deckbuild'),
    path('deckview/<str:deckid>', views.deckview, name='deckview'),
    path('card_search/<str:cardside>/', views.card_search, name='card_search'),
    path('deck_build', views.deck_build, name="deck_build"),
    path('deck_check/<str:deckname>', views.deck_check, name="deck_check"),
    path('index_search/<str:parameter>', views.index_search, name="index_search"),
]