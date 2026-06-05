import json
from pathlib import Path

from django.core.management.base import BaseCommand

from swccg.models import starwarscard

CARD_FIELDS = {
    "title",
    "type",
    "errataSymbol",
    "errataDate",
    "errataNotes",
    "previousId",
    "side",
    "gametext",
    "deploy",
    "characteristics",
    "destiny",
    "forfeit",
    "icons",
    "imageUrl",
    "lore",
    "power",
    "subType",
    "gempId",
    "set",
    "rarity",
    "conceptBy",
    "legacy",
    "extraText",
    "uniqueness",
    "armor",
    "errataVersion",
    "sourceType",
    "landspeed",
    "ability",
    "hyperspeed",
    "maneuver",
    "politics",
    "parsec",
    "lightSideIcons",
    "darkSideIcons",
    "ferocity",
    "destinyValues",
    "backsideImageUrl",
    "backSideText",
    "backSideTitle",
    "printableSlipUrl",
    "printableSlipType",
}

ARRAY_FIELDS = {"icons", "extraText", "destinyValues"}
SKIP_TOP_LEVEL = {"printings", "front", "back", "counterpart", "rulings", "canceledBy", "pulledBy", "abbr"}


def normalize_value(field_name, value):
    if field_name in ARRAY_FIELDS:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value]
        return [str(value)]

    if field_name == "characteristics" and isinstance(value, list):
        return ", ".join(str(item) for item in value)

    if field_name == "legacy" and isinstance(value, str):
        return value.lower() in {"true", "1", "yes"}

    if value is None:
        return None

    return value


def card_from_json(raw_card, default_side):
    attrs = {"id": raw_card["id"]}

    for key, value in raw_card.items():
        if key in SKIP_TOP_LEVEL or isinstance(value, (list, dict)):
            continue
        if key in CARD_FIELDS:
            attrs[key] = normalize_value(key, value)

    front = raw_card.get("front", {})
    for key, value in front.items():
        if key in CARD_FIELDS:
            attrs[key] = normalize_value(key, value)

    back = raw_card.get("back", {})
    if back:
        if "gametext" in back:
            attrs["backSideText"] = back["gametext"]
        if "imageUrl" in back:
            attrs["backsideImageUrl"] = back["imageUrl"]
        if "title" in back:
            attrs["backSideTitle"] = back["title"]

    attrs.setdefault("side", default_side)
    return attrs


class Command(BaseCommand):
    help = "Import cards from swccg/Light.json and swccg/Dark.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing cards before importing",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = starwarscard.objects.all().delete()
            self.stdout.write(f"Deleted {deleted} existing cards")

        base_dir = Path(__file__).resolve().parents[2]
        files = [
            (base_dir / "Light.json", "Light"),
            (base_dir / "Dark.json", "Dark"),
        ]

        created = 0
        updated = 0

        for file_path, default_side in files:
            with file_path.open(encoding="utf-8") as handle:
                payload = json.load(handle)

            for raw_card in payload["cards"]:
                attrs = card_from_json(raw_card, default_side)
                card_id = attrs.pop("id")
                _, was_created = starwarscard.objects.update_or_create(
                    id=card_id,
                    defaults=attrs,
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

            self.stdout.write(f"Processed {file_path.name}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Import complete: {created} created, {updated} updated, "
                f"{starwarscard.objects.count()} total cards"
            )
        )
