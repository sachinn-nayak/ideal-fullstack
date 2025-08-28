from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Order


class Command(BaseCommand):
    help = 'Clean up old pending orders (older than 1 hour)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=1,
            help='Number of hours after which to consider orders as old (default: 1)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        hours = options['hours']
        dry_run = options['dry_run']
        
        cutoff_time = timezone.now() - timedelta(hours=hours)
        old_pending_orders = Order.objects.filter(
            status='pending',
            payment_status='pending',
            created_at__lt=cutoff_time
        )
        
        count = old_pending_orders.count()
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would delete {count} pending orders older than {hours} hour(s)'
                )
            )
            for order in old_pending_orders[:5]:  # Show first 5 as examples
                self.stdout.write(f'  - Order {order.order_number} created at {order.created_at}')
            if count > 5:
                self.stdout.write(f'  ... and {count - 5} more')
        else:
            if count > 0:
                old_pending_orders.delete()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully deleted {count} pending orders older than {hours} hour(s)'
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'No pending orders older than {hours} hour(s) found'
                    )
                )

