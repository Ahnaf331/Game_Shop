from django.core.management.base import BaseCommand
from apps.catalog.models import Category, Platform, Game, GamePlatform

CATEGORIES = [
    ('Action', 'action', 'Fast-paced action and combat games'),
    ('RPG', 'rpg', 'Role-playing games with deep stories'),
    ('Strategy', 'strategy', 'Strategic thinking and planning games'),
    ('Sports', 'sports', 'Sports simulation games'),
    ('Racing', 'racing', 'Racing and driving games'),
    ('Puzzle', 'puzzle', 'Brain-teasing puzzle games'),
    ('Adventure', 'adventure', 'Story-driven adventure games'),
    ('Music', 'music', 'Music and rhythm games'),
]

PLATFORMS = [
    ('PC', 'pc', 'pc'),
    ('PlayStation 5', 'ps5', 'console'),
    ('Xbox Series X', 'xbox-series-x', 'console'),
    ('Nintendo Switch', 'nintendo-switch', 'console'),
]

# Steam header images: cdn.akamai.steamstatic.com/steam/apps/{app_id}/header.jpg
STEAM = 'https://cdn.akamai.steamstatic.com/steam/apps'

GAMES = [
    {
        'title': 'Grand Theft Auto V',
        'description': (
            'Experience the sprawling crime epic of Los Santos. Switch between three playable '
            'protagonists — Michael, Trevor, and Franklin — as their paths collide in a city '
            'obsessed with celebrity, money, and self-indulgence. Includes GTA Online.'
        ),
        'developer': 'Rockstar North',
        'publisher': 'Rockstar Games',
        'release_date': '2015-04-14',
        'cover_image_url': f'{STEAM}/271590/header.jpg',
        'categories': ['action', 'adventure'],
        'is_featured': True,
        'platforms': [
            ('pc', '19.99'),
            ('ps5', '24.99'),
            ('xbox-series-x', '24.99'),
        ],
    },
    {
        'title': 'Red Dead Redemption 2',
        'description': (
            'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. '
            'A sweeping epic of life in America at the dawn of the modern age — a breathtaking '
            'open world with unmatched depth and detail.'
        ),
        'developer': 'Rockstar Games',
        'publisher': 'Rockstar Games',
        'release_date': '2019-11-05',
        'cover_image_url': f'{STEAM}/1174180/header.jpg',
        'categories': ['action', 'adventure'],
        'is_featured': True,
        'platforms': [
            ('pc', '29.99'),
            ('ps5', '34.99'),
            ('xbox-series-x', '34.99'),
        ],
    },
    {
        'title': 'The Witcher 3: Wild Hunt',
        'description': (
            'Play as a professional monster hunter in a vast open world. Search for your missing '
            'adopted daughter across a war-torn fantasy landscape. Winner of over 250 Game of the '
            'Year awards. Includes all DLC.'
        ),
        'developer': 'CD Projekt Red',
        'publisher': 'CD Projekt',
        'release_date': '2015-05-18',
        'cover_image_url': f'{STEAM}/292030/header.jpg',
        'categories': ['rpg', 'adventure'],
        'is_featured': True,
        'platforms': [
            ('pc', '19.99'),
            ('ps5', '29.99'),
            ('xbox-series-x', '29.99'),
            ('nintendo-switch', '39.99'),
        ],
    },
    {
        'title': 'God of War',
        'description': (
            'Kratos is a father again. In this new chapter, he and his son Atreus journey '
            'through Norse mythology. A bold reimagining of the franchise that delivers stunning '
            'visuals, masterful combat, and an emotionally gripping story.'
        ),
        'developer': 'Santa Monica Studio',
        'publisher': 'Sony Interactive Entertainment',
        'release_date': '2022-01-14',
        'cover_image_url': f'{STEAM}/1593500/header.jpg',
        'categories': ['action', 'adventure'],
        'is_featured': True,
        'platforms': [
            ('pc', '24.99'),
            ('ps5', '29.99'),
        ],
    },
    {
        'title': 'Cyberpunk 2077',
        'description': (
            'An open-world action-adventure set in Night City — a megalopolis obsessed with power, '
            'glamour, and body modification. Play as V, a mercenary outlaw going after a '
            'one-of-a-kind implant that is the key to immortality.'
        ),
        'developer': 'CD Projekt Red',
        'publisher': 'CD Projekt',
        'release_date': '2020-12-10',
        'cover_image_url': f'{STEAM}/1091500/header.jpg',
        'categories': ['rpg', 'action'],
        'is_featured': True,
        'platforms': [
            ('pc', '29.99'),
            ('ps5', '34.99'),
            ('xbox-series-x', '34.99'),
        ],
    },
    {
        'title': 'Elden Ring',
        'description': (
            'Rise, Tarnished. A vast open world created by Hidetaka Miyazaki and George R.R. Martin. '
            'Journey through the Lands Between, battling fearsome enemies and uncovering the '
            'shattered fragments of the Elden Ring. Over 10 million copies sold.'
        ),
        'developer': 'FromSoftware',
        'publisher': 'Bandai Namco Entertainment',
        'release_date': '2022-02-25',
        'cover_image_url': f'{STEAM}/1245620/header.jpg',
        'categories': ['action', 'rpg'],
        'is_featured': True,
        'platforms': [
            ('pc', '34.99'),
            ('ps5', '39.99'),
            ('xbox-series-x', '39.99'),
        ],
    },
    {
        'title': 'The Last of Us Part I',
        'description': (
            'Experience the emotional story of Joel and Ellie in this complete remake of the '
            'acclaimed original. Journey across a post-pandemic America filled with infected '
            'and desperate survivors. Features rebuilt gameplay, enhanced accessibility, and '
            'full trophy support.'
        ),
        'developer': 'Naughty Dog',
        'publisher': 'Sony Interactive Entertainment',
        'release_date': '2023-03-28',
        'cover_image_url': f'{STEAM}/1888930/header.jpg',
        'categories': ['action', 'adventure'],
        'is_featured': True,
        'platforms': [
            ('pc', '29.99'),
            ('ps5', '39.99'),
        ],
    },
    {
        'title': 'Hogwarts Legacy',
        'description': (
            'Live the unwritten. Discover your legacy in the 1800s wizarding world. '
            'Your character is a student who holds the key to an ancient secret that '
            'threatens to tear the wizarding world apart. Make allies, battle Dark wizards, '
            'and ultimately decide the fate of the wizarding world.'
        ),
        'developer': 'Avalanche Software',
        'publisher': 'Warner Bros. Games',
        'release_date': '2023-02-10',
        'cover_image_url': f'{STEAM}/990080/header.jpg',
        'categories': ['rpg', 'adventure'],
        'is_featured': True,
        'platforms': [
            ('pc', '29.99'),
            ('ps5', '34.99'),
            ('xbox-series-x', '34.99'),
            ('nintendo-switch', '39.99'),
        ],
    },
    {
        'title': 'FIFA 24',
        'description': (
            'EA SPORTS FC 24 brings football to life with HyperMotionV technology. '
            'Play with 19,000+ players, 700+ teams, and 30+ leagues. New PlayStyles system '
            'brings individual traits and tendencies to life like never before.'
        ),
        'developer': 'EA Sports',
        'publisher': 'Electronic Arts',
        'release_date': '2023-09-29',
        'cover_image_url': f'{STEAM}/2195250/header.jpg',
        'categories': ['sports'],
        'is_featured': False,
        'platforms': [
            ('pc', '19.99'),
            ('ps5', '24.99'),
            ('xbox-series-x', '24.99'),
        ],
    },
    {
        'title': 'Forza Horizon 5',
        'description': (
            'Your Ultimate Horizon Adventure awaits! Explore the vibrant open-world landscape '
            'of Mexico with limitless, fun driving action in hundreds of the world\'s greatest '
            'cars. Winner of multiple racing game of the year awards.'
        ),
        'developer': 'Playground Games',
        'publisher': 'Xbox Game Studios',
        'release_date': '2021-11-09',
        'cover_image_url': f'{STEAM}/1551360/header.jpg',
        'categories': ['racing'],
        'is_featured': False,
        'platforms': [
            ('pc', '24.99'),
            ('xbox-series-x', '29.99'),
        ],
    },
    {
        'title': 'Assassin\'s Creed Valhalla',
        'description': (
            'Become Eivor, a Viking raider raised on tales of battle and glory. Raid, conquer, '
            'and build settlements as you explore a massive open world set across Norway and England. '
            'Lead your clan from the icy peaks of Norway to the rich farmlands of England.'
        ),
        'developer': 'Ubisoft Montreal',
        'publisher': 'Ubisoft',
        'release_date': '2020-11-10',
        'cover_image_url': f'{STEAM}/2208920/header.jpg',
        'categories': ['action', 'rpg'],
        'is_featured': False,
        'platforms': [
            ('pc', '19.99'),
            ('ps5', '24.99'),
            ('xbox-series-x', '24.99'),
        ],
    },
    {
        'title': 'Spider-Man: Miles Morales',
        'description': (
            'In the latest chapter of Marvel\'s Spider-Man universe, teenager Miles Morales '
            'adjusts to his new home while following in the footsteps of his mentor, Peter Parker. '
            'A supercharged venom blast and camouflage ability set Miles apart.'
        ),
        'developer': 'Insomniac Games',
        'publisher': 'Sony Interactive Entertainment',
        'release_date': '2022-11-18',
        'cover_image_url': f'{STEAM}/1817070/header.jpg',
        'categories': ['action', 'adventure'],
        'is_featured': False,
        'platforms': [
            ('pc', '24.99'),
            ('ps5', '29.99'),
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with popular games, platforms, and categories'

    def handle(self, *args, **options):
        self.stdout.write('Seeding categories...')
        cat_map = {}
        for name, slug, desc in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc},
            )
            cat_map[slug] = cat
            if created:
                self.stdout.write(f'  + {name}')

        self.stdout.write('Seeding platforms...')
        plat_map = {}
        for name, slug, family in PLATFORMS:
            plat, created = Platform.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'family': family},
            )
            plat_map[slug] = plat
            if created:
                self.stdout.write(f'  + {name}')

        self.stdout.write('Seeding games...')
        for game_data in GAMES:
            platform_entries = game_data.pop('platforms')
            category_slugs = game_data.pop('categories')

            if Game.objects.filter(title=game_data['title']).exists():
                self.stdout.write(f'  ~ skipped (exists): {game_data["title"]}')
                continue

            game = Game(**game_data)
            game.save()

            game.categories.set([cat_map[s] for s in category_slugs if s in cat_map])

            for plat_slug, price in platform_entries:
                if plat_slug in plat_map:
                    GamePlatform.objects.get_or_create(
                        game=game,
                        platform=plat_map[plat_slug],
                        defaults={'base_price': price},
                    )

            self.stdout.write(f'  + {game.title}')

        self.stdout.write(self.style.SUCCESS('\nDone! Database seeded with popular games.'))
