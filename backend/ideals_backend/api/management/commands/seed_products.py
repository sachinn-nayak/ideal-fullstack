from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Product


class Command(BaseCommand):
    help = 'Seed the database with Apple products'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Apple products...')
        
        # Create products data
        products_data = [
            # Mobile Phones
            {
                'name': 'iPhone 15 Pro',
                'description': 'The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system with 48MP main camera.',
                'price': 999.00,
                'wholesale_price': 850.00,
                'category': 'mobile',
                'stock': 50,
                'brand': 'Apple',
                'model': 'iPhone 15 Pro',
                'color': 'Natural Titanium',
                'storage': '128GB, 256GB, 512GB, 1TB',
                'ram': '8GB',
                'battery': 'Up to 23 hours video playback',
                'connectivity': '5G, WiFi 6, Bluetooth 5.3, USB-C',
                'images': [
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-back-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-side-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-camera-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708'
                ],
                'is_active': True,
            },
            {
                'name': 'iPhone 15',
                'description': 'The new iPhone 15 features a stunning 6.1-inch Super Retina XDR display, A16 Bionic chip, and advanced dual-camera system.',
                'price': 799.00,
                'wholesale_price': 680.00,
                'category': 'mobile',
                'stock': 75,
                'brand': 'Apple',
                'model': 'iPhone 15',
                'color': 'Blue',
                'storage': '128GB, 256GB, 512GB',
                'ram': '6GB',
                'battery': 'Up to 20 hours video playback',
                'connectivity': '5G, WiFi 6, Bluetooth 5.3, USB-C',
                'images': [
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-blue?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-back-select-202309-6-1inch-blue?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-side-select-202309-6-1inch-blue?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-camera-select-202309-6-1inch-blue?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708'
                ],
                'is_active': True,
            },
            
            # Laptops
            {
                'name': 'MacBook Pro 14-inch',
                'description': 'The most powerful MacBook Pro ever with M3 Pro chip, 14-inch Liquid Retina XDR display, and up to 22 hours of battery life.',
                'price': 1999.00,
                'wholesale_price': 1700.00,
                'category': 'laptop',
                'stock': 30,
                'brand': 'Apple',
                'model': 'MacBook Pro 14-inch',
                'color': 'Space Black',
                'storage': '512GB SSD, 1TB SSD, 2TB SSD',
                'ram': '18GB, 36GB, 96GB',
                'battery': 'Up to 22 hours battery life',
                'connectivity': 'WiFi 6E, Bluetooth 5.3, Thunderbolt 4, HDMI 2.1',
                'images': [
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-back-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-side-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spaceblack-keyboard-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290'
                ],
                'is_active': True,
            },
            {
                'name': 'MacBook Air 15-inch',
                'description': 'The world\'s best 15-inch laptop with M2 chip, stunning Liquid Retina display, and all-day battery life.',
                'price': 1299.00,
                'wholesale_price': 1100.00,
                'category': 'laptop',
                'stock': 45,
                'brand': 'Apple',
                'model': 'MacBook Air 15-inch',
                'color': 'Midnight',
                'storage': '256GB SSD, 512GB SSD, 1TB SSD, 2TB SSD',
                'ram': '8GB, 16GB, 24GB',
                'battery': 'Up to 18 hours battery life',
                'connectivity': 'WiFi 6, Bluetooth 5.3, Thunderbolt 4, MagSafe 3',
                'images': [
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1683136324205',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-back-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1683136324205',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-side-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1683136324205',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-keyboard-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1683136324205'
                ],
                'is_active': True,
            },
            
            # Watches
            {
                'name': 'Apple Watch Series 9',
                'description': 'The most advanced Apple Watch ever with S9 chip, faster on-device Siri, and Double Tap gesture.',
                'price': 399.00,
                'wholesale_price': 340.00,
                'category': 'watch',
                'stock': 60,
                'brand': 'Apple',
                'model': 'Apple Watch Series 9',
                'color': 'Aluminum',
                'storage': '64GB',
                'ram': '2GB',
                'battery': 'Up to 18 hours battery life',
                'connectivity': 'GPS, Cellular, WiFi, Bluetooth 5.3',
                'images': [
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-45-alum-midnight-nc-9s_VW_34FR_WF_CO_GEO_IN?wid=1400&hei=1400',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-45-alum-midnight-nc-9s-back_VW_34FR_WF_CO_GEO_IN?wid=1400&hei=1400',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-45-alum-midnight-nc-9s-side_VW_34FR_WF_CO_GEO_IN?wid=1400&hei=1400',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-45-alum-midnight-nc-9s-crown_VW_34FR_WF_CO_GEO_IN?wid=1400&hei=1400'
                ],
                'is_active': True,
            },
            {
                'name': 'Apple Watch Ultra 2',
                'description': 'The most rugged and capable Apple Watch with titanium case, precision dual-frequency GPS, and up to 36 hours of battery life.',
                'price': 799.00,
                'wholesale_price': 680.00,
                'category': 'watch',
                'stock': 25,
                'brand': 'Apple',
                'model': 'Apple Watch Ultra 2',
                'color': 'Titanium',
                'storage': '64GB',
                'ram': '2GB',
                'battery': 'Up to 36 hours battery life',
                'connectivity': 'GPS, Cellular, WiFi, Bluetooth 5.3, Emergency SOS',
                'images': [
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-49-titanium-ultra_VW_34FR_WF_CO_GEO_IN?wid=1400&hei=1400',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-49-titanium-ultra-back_VW_34FR_WF_CO_GEO_IN?wid=1400&hei=1400',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-49-titanium-ultra-side_VW_34FR_WF_CO_GEO_IN?wid=1400&hei=1400',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MKUQ3_VW_34FR+watch-49-titanium-ultra-crown_VW_34FR_WF_CO_GEO_IN?wid=1400&hei=1400'
                ],
                'is_active': True,
            },
            
            # Headsets
            {
                'name': 'AirPods Pro (2nd generation)',
                'description': 'The most advanced AirPods Pro with Active Noise Cancellation, Personalized Spatial Audio, and MagSafe Charging Case.',
                'price': 249.00,
                'wholesale_price': 210.00,
                'category': 'headset',
                'stock': 80,
                'brand': 'Apple',
                'model': 'AirPods Pro (2nd generation)',
                'color': 'White',
                'storage': 'N/A',
                'ram': 'N/A',
                'battery': 'Up to 6 hours listening time, up to 30 hours total with case',
                'connectivity': 'Bluetooth 5.3, Active Noise Cancellation, Transparency mode',
                'images': [
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83-back?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83-case?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83-earbuds?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361'
                ],
                'is_active': True,
            },
            {
                'name': 'AirPods Max',
                'description': 'The ultimate personal listening experience with Active Noise Cancellation, Transparency mode, and Spatial Audio.',
                'price': 549.00,
                'wholesale_price': 465.00,
                'category': 'headset',
                'stock': 35,
                'brand': 'Apple',
                'model': 'AirPods Max',
                'color': 'Space Gray',
                'storage': 'N/A',
                'ram': 'N/A',
                'battery': 'Up to 20 hours listening time',
                'connectivity': 'Bluetooth 5.0, Active Noise Cancellation, Transparency mode, Spatial Audio',
                'images': [
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-hero-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604709293000',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-back-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604709293000',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-side-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604709293000',
                    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-case-select-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604709293000'
                ],
                'is_active': True,
            },
        ]
        
        # Create products
        created_count = 0
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults=product_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'Created: {product.name}')
            else:
                self.stdout.write(f'Already exists: {product.name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} new products!')
        )
