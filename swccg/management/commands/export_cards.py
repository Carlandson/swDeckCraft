from django.core.management.base import BaseCommand
from swccg.models import starwarscard
import json

class Command(BaseCommand):
    help = 'Export cards to JSON with proper encoding'

    def handle(self, *args, **options):
        cards = list(starwarscard.objects.all().values())
        output = []
        
        for card in cards:
            card_id = card.pop('id')  # Remove id from fields
            output.append({
                "model": "swccg.starwarscard",
                "pk": card_id,
                "fields": card
            })
        
        with open('starwars_cards.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        self.stdout.write(self.style.SUCCESS('Successfully exported cards'))