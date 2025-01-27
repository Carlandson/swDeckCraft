from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Deck, Card

@require_http_methods(["GET"])
def get_user_decks(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'User not authenticated'}, status=401)

    decks = Deck.objects.filter(user=user)
    deck_data = [{
        'id': deck.id,
        'name': deck.name,
        'cards': [{'id': card.id, 'name': card.name, 'count': card.count} for card in deck.cards.all()]
    } for deck in decks]

    return JsonResponse({'decks': deck_data})

@require_http_methods(["POST"])
def save_deck(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'User not authenticated'}, status=401)

    data = json.loads(request.body)
    deck_name = data.get('name')
    cards = data.get('cards')

    deck, created = Deck.objects.get_or_create(user=user, name=deck_name)
    deck.cards.clear()
    for card_data in cards:
        card = Card.objects.get(id=card_data['id'])
        deck.cards.add(card, through_defaults={'count': card_data['count']})

    return JsonResponse({'success': True, 'deck_id': deck.id})