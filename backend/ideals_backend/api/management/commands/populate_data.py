from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Product, Customer, Order, OrderItem, AdminUser
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@ideals.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created admin user')

        # Create products
        products_data = [
            {
                'name': 'iPhone 15 Pro',
                'description': 'Latest iPhone with A17 Pro chip and titanium design',
                'price': Decimal('999.00'),
                'category': 'mobile',
                'image': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
                'stock': 25,
                'brand': 'Apple',
                'model': 'iPhone 15 Pro',
                'color': 'Natural Titanium',
                'storage': '128GB',
                'battery': 'Up to 23 hours',
                'connectivity': '5G'
            },
            {
                'name': 'MacBook Air M2',
                'description': 'Ultra-thin laptop with M2 chip for ultimate performance',
                'price': Decimal('1199.00'),
                'category': 'laptop',
                'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
                'stock': 15,
                'brand': 'Apple',
                'model': 'MacBook Air',
                'color': 'Space Gray',
                'storage': '256GB SSD',
                'ram': '8GB Unified Memory',
                'battery': 'Up to 18 hours'
            },
            {
                'name': 'AirPods Pro 2nd Gen',
                'description': 'Active noise cancellation with spatial audio',
                'price': Decimal('249.00'),
                'category': 'headphones',
                'image': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
                'stock': 50,
                'brand': 'Apple',
                'model': 'AirPods Pro',
                'color': 'White',
                'battery': 'Up to 6 hours',
                'connectivity': 'Bluetooth 5.0'
            },
            {
                'name': 'iPad Air',
                'description': 'Powerful tablet with M1 chip and all-day battery',
                'price': Decimal('599.00'),
                'category': 'mobile',
                'image': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
                'stock': 30,
                'brand': 'Apple',
                'model': 'iPad Air',
                'color': 'Space Gray',
                'storage': '64GB',
                'battery': 'Up to 10 hours',
                'connectivity': 'Wi-Fi + Cellular'
            },
            {
                'name': 'MacBook Pro 14"',
                'description': 'Professional laptop with M3 Pro chip',
                'price': Decimal('1999.00'),
                'category': 'laptop',
                'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
                'stock': 8,
                'brand': 'Apple',
                'model': 'MacBook Pro 14"',
                'color': 'Space Black',
                'storage': '512GB SSD',
                'ram': '18GB Unified Memory',
                'battery': 'Up to 22 hours'
            }
        ]

        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults=product_data
            )
            if created:
                self.stdout.write(f'Created product: {product.name}')

        # Create customers
        customers_data = [
            {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '+1-555-0123'
            },
            {
                'name': 'Jane Smith',
                'email': 'jane@example.com',
                'phone': '+1-555-0456'
            },
            {
                'name': 'Mike Johnson',
                'email': 'mike@example.com',
                'phone': '+1-555-0789'
            }
        ]

        for customer_data in customers_data:
            customer, created = Customer.objects.get_or_create(
                email=customer_data['email'],
                defaults=customer_data
            )
            if created:
                self.stdout.write(f'Created customer: {customer.name}')

        # Create orders
        orders_data = [
            {
                'customer_email': 'john@example.com',
                'total': Decimal('999.00'),
                'status': 'paid',
                'payment_status': 'paid',
                'shipping_address': '123 Main St',
                'shipping_city': 'New York',
                'shipping_state': 'NY',
                'shipping_zip_code': '10001',
                'shipping_country': 'USA',
                'tracking_number': 'TRK123456789',
                'items': [
                    {'product_name': 'iPhone 15 Pro', 'quantity': 1, 'price': Decimal('999.00')}
                ]
            },
            {
                'customer_email': 'jane@example.com',
                'total': Decimal('1448.00'),
                'status': 'processing',
                'payment_status': 'paid',
                'shipping_address': '456 Oak Ave',
                'shipping_city': 'Los Angeles',
                'shipping_state': 'CA',
                'shipping_zip_code': '90210',
                'shipping_country': 'USA',
                'items': [
                    {'product_name': 'MacBook Air M2', 'quantity': 1, 'price': Decimal('1199.00')},
                    {'product_name': 'AirPods Pro 2nd Gen', 'quantity': 1, 'price': Decimal('249.00')}
                ]
            },
            {
                'customer_email': 'mike@example.com',
                'total': Decimal('1198.00'),
                'status': 'pending',
                'payment_status': 'pending',
                'shipping_address': '789 Pine St',
                'shipping_city': 'Chicago',
                'shipping_state': 'IL',
                'shipping_zip_code': '60601',
                'shipping_country': 'USA',
                'items': [
                    {'product_name': 'iPad Air', 'quantity': 2, 'price': Decimal('599.00')}
                ]
            }
        ]

        for order_data in orders_data:
            customer = Customer.objects.get(email=order_data['customer_email'])
            order, created = Order.objects.get_or_create(
                customer=customer,
                total=order_data['total'],
                defaults={
                    'status': order_data['status'],
                    'payment_status': order_data['payment_status'],
                    'shipping_address': order_data['shipping_address'],
                    'shipping_city': order_data['shipping_city'],
                    'shipping_state': order_data['shipping_state'],
                    'shipping_zip_code': order_data['shipping_zip_code'],
                    'shipping_country': order_data['shipping_country'],
                    'tracking_number': order_data.get('tracking_number'),
                }
            )
            if created:
                self.stdout.write(f'Created order: {order.order_number}')
                
                # Create order items
                for item_data in order_data['items']:
                    product = Product.objects.get(name=item_data['product_name'])
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=item_data['product_name'],
                        product_image=product.image,
                        quantity=item_data['quantity'],
                        price=item_data['price'],
                        total=item_data['quantity'] * item_data['price']
                    )

        # Create admin user profile
        admin_profile, created = AdminUser.objects.get_or_create(
            user=admin_user,
            defaults={
                'role': 'admin',
                'is_active': True
            }
        )
        if created:
            self.stdout.write('Created admin user profile')

        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data'))

