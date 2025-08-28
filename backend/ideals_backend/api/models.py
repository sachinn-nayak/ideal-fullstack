from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Address(models.Model):
    ADDRESS_TYPE_CHOICES = [
        ('billing', 'Billing Address'),
        ('shipping', 'Shipping Address'),
    ]

    customer = models.ForeignKey('Customer', on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(max_length=20, choices=ADDRESS_TYPE_CHOICES)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Addresses"
        unique_together = ['customer', 'address_type', 'is_default']

    def __str__(self):
        return f"{self.customer.name} - {self.get_address_type_display()}"

    def save(self, *args, **kwargs):
        # Ensure only one default address per type per customer
        if self.is_default:
            Address.objects.filter(
                customer=self.customer,
                address_type=self.address_type,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('mobile', 'Mobile'),
        ('laptop', 'Laptop'),
        ('watch', 'Watch'),
        ('headset', 'Headset'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    images = models.JSONField(default=list, blank=True)  # Store multiple image URLs
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)  # Soft delete
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Specifications
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    color = models.CharField(max_length=50)
    storage = models.CharField(max_length=50, blank=True, null=True)
    ram = models.CharField(max_length=50, blank=True, null=True)
    battery = models.CharField(max_length=100, blank=True, null=True)
    connectivity = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)  # Keep for backward compatibility
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def get_default_billing_address(self):
        return self.addresses.filter(address_type='billing', is_default=True).first()

    def get_default_shipping_address(self):
        return self.addresses.filter(address_type='shipping', is_default=True).first()


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('failed', 'Failed'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('cod', 'Cash on Delivery'),
    ]

    order_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='online')
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # For COD orders
    advance_verified = models.BooleanField(default=False)  # For COD advance verification
    
    # Billing and Shipping addresses
    billing_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='billing_orders')
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipping_orders')
    
    # Legacy shipping fields (for backward compatibility)
    shipping_address_text = models.TextField(blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_state = models.CharField(max_length=100, blank=True, null=True)
    shipping_zip_code = models.CharField(max_length=20, blank=True, null=True)
    shipping_country = models.CharField(max_length=100, blank=True, null=True)
    
    # Tracking information
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    estimated_delivery = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number
            last_order = Order.objects.order_by('-id').first()
            if last_order:
                last_number = int(last_order.order_number.split('-')[-1])
                self.order_number = f"ORD-2024-{last_number + 1:03d}"
            else:
                self.order_number = "ORD-2024-001"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=200)  # Store product name at time of order
    product_image = models.URLField(blank=True, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of order
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in Order {self.order.order_number}"

    def save(self, *args, **kwargs):
        if not self.total:
            self.total = self.quantity * self.price
        super().save(*args, **kwargs)


class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('failed', 'Failed'),
    ]

    payment_id = models.CharField(max_length=50, unique=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.payment_id} - {self.order.order_number}"

    def save(self, *args, **kwargs):
        if not self.payment_id:
            # Generate payment ID
            last_payment = Payment.objects.order_by('-id').first()
            if last_payment:
                last_number = int(last_payment.payment_id.split('-')[-1])
                self.payment_id = f"PAY-2024-{last_number + 1:03d}"
            else:
                self.payment_id = "PAY-2024-001"
        super().save(*args, **kwargs)

    @property
    def payment_method(self):
        """Get payment method based on related payment type"""
        if hasattr(self, 'onlinepayment'):
            return 'online'
        elif hasattr(self, 'offlinepayment'):
            return 'offline'
        elif hasattr(self, 'codpayment'):
            return 'cod'
        return None


class OnlinePayment(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='onlinepayment')
    transaction_id = models.CharField(max_length=100, unique=True)
    gateway = models.CharField(max_length=50, default='razorpay')  # razorpay, stripe, etc.
    gateway_response = models.JSONField(default=dict, blank=True)  # Store gateway response
    refund_id = models.CharField(max_length=100, blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    refund_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processed', 'Processed'),
        ('failed', 'Failed')
    ], default='pending')

    def __str__(self):
        return f"Online Payment - {self.payment.payment_id}"


class OfflinePayment(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='offlinepayment')
    screenshot = models.URLField()
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Offline Payment - {self.payment.payment_id}"


class CODPayment(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='codpayment')
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=200.00)
    advance_verified = models.BooleanField(default=False)
    advance_screenshot = models.URLField(blank=True, null=True)
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"COD Payment - {self.payment.payment_id}"


class AdminUser(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='manager')
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
