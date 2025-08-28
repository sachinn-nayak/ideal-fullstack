from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid
import os


def generate_order_number():
    return f"ORD-{uuid.uuid4().hex[:8].upper()}"


def generate_invoice_number():
    return f"INV-{uuid.uuid4().hex[:8].upper()}"


def product_image_path(instance, filename):
    return f'products/{instance.id}/{filename}'


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    brand = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=50, blank=True)
    images = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def get_default_billing_address(self):
        return self.addresses.filter(address_type='billing', is_default=True).first()

    def get_default_shipping_address(self):
        return self.addresses.filter(address_type='shipping', is_default=True).first()


class Address(models.Model):
    ADDRESS_TYPES = [
        ('billing', 'Billing'),
        ('shipping', 'Shipping'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPES)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.name} - {self.address_type} - {self.street_address}"

    class Meta:
        verbose_name_plural = "Addresses"


class AdminUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=50, default='admin')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username


class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('verified', 'Verified'),
        ('failed', 'Failed'),
        ('rejected', 'Rejected'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('online', 'Online Payment'),
        ('offline', 'Offline Payment'),
        ('cod', 'Cash on Delivery'),
    ]
    
    order_number = models.CharField(max_length=20, unique=True, default=generate_order_number)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    advance_verified = models.BooleanField(default=False)
    
    # Payment verification fields
    payment_verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_orders')
    payment_verified_at = models.DateTimeField(null=True, blank=True)
    payment_rejection_reason = models.TextField(blank=True)
    
    billing_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='billing_orders')
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipping_orders')
    shipping_address_text = models.TextField(blank=True)
    shipping_city = models.CharField(max_length=100, blank=True)
    shipping_state = models.CharField(max_length=100, blank=True)
    shipping_zip_code = models.CharField(max_length=20, blank=True)
    shipping_country = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_number} - {self.customer.name}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = generate_order_number()
        super().save(*args, **kwargs)

    @property
    def requires_payment_verification(self):
        """Check if order requires payment verification (offline payments)"""
        return self.payment_method == 'offline' and self.payment_status == 'processing'

    @property
    def can_move_to_dispatch(self):
        """Check if order can move to dispatch stage"""
        return (self.status == 'processing' and 
                self.payment_status in ['verified'] and
                self.payment_method in ['online', 'cod'])

    @property
    def can_move_to_bill_generated(self):
        """Check if order can move to bill generated stage"""
        return (self.status == 'processing' and 
                self.payment_status == 'verified' and
                hasattr(self, 'invoice') and self.invoice is not None)

    @property
    def can_move_to_out_for_delivery(self):
        """Check if order can move to out for delivery"""
        return (self.status == 'processing' and 
                self.payment_status == 'verified' and
                hasattr(self, 'shipment_details') and self.shipment_details is not None)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=200)
    product_image = models.URLField(blank=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product_name} - {self.quantity}"

    def save(self, *args, **kwargs):
        if not self.total:
            self.total = self.quantity * self.price
        super().save(*args, **kwargs)


class Payment(models.Model):
    PAYMENT_TYPES = [
        ('online', 'Online Payment'),
        ('offline', 'Offline Payment'),
        ('cod', 'Cash on Delivery'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES, default='cod')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Order.PAYMENT_STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.order.order_number}"


class OnlinePayment(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE)
    gateway = models.CharField(max_length=50)
    gateway_transaction_id = models.CharField(max_length=100, blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Online Payment - {self.payment.transaction_id}"


class OfflinePayment(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE)
    payment_method = models.CharField(max_length=50, default='bank_transfer')
    reference_number = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    payment_proof = models.FileField(upload_to='payment_proofs/', blank=True)

    def __str__(self):
        return f"Offline Payment - {self.payment.transaction_id}"


class CODPayment(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE)
    collected_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    collected_date = models.DateTimeField(null=True, blank=True)
    collected_by = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"COD Payment - {self.payment.transaction_id}"


class Invoice(models.Model):
    INVOICE_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('generated', 'Generated'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    
    invoice_number = models.CharField(max_length=20, unique=True, default=generate_invoice_number)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=INVOICE_STATUS_CHOICES, default='draft')
    invoice_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    terms_conditions = models.TextField(blank=True)
    
    # Company details
    company_name = models.CharField(max_length=200, default='iDeals')
    company_address = models.TextField(default='Your Company Address')
    company_phone = models.CharField(max_length=20, default='+91 1234567890')
    company_email = models.EmailField(default='info@ideals.com')
    company_gst = models.CharField(max_length=20, default='GST123456789')
    
    # PDF file
    pdf_file = models.FileField(upload_to='invoices/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.order.order_number}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = generate_invoice_number()
        super().save(*args, **kwargs)

    @property
    def customer_name(self):
        return self.order.customer.name

    @property
    def customer_email(self):
        return self.order.customer.email

    @property
    def shipping_address(self):
        if self.order.shipping_address:
            return f"{self.order.shipping_address.street_address}, {self.order.shipping_address.city}, {self.order.shipping_address.state} {self.order.shipping_address.zip_code}, {self.order.shipping_address.country}"
        return self.order.shipping_address_text


class ShipmentDetails(models.Model):
    SHIPMENT_METHOD_CHOICES = [
        ('porter', 'Porter'),
        ('bus_agency', 'Bus Agency'),
        ('courier', 'Courier Service'),
        ('local_delivery', 'Local Delivery'),
        ('pickup', 'Customer Pickup'),
        ('truck', 'Truck'),
        ('bike', 'Bike'),
        ('car', 'Car'),
        ('other', 'Other'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment_details')
    shipment_method = models.CharField(max_length=20, choices=SHIPMENT_METHOD_CHOICES)
    vehicle_number = models.CharField(max_length=20, blank=True)
    vehicle_type = models.CharField(max_length=50, blank=True)
    driver_name = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=20)
    tracking_number = models.CharField(max_length=100)
    estimated_delivery = models.DateTimeField()
    actual_delivery = models.DateTimeField(null=True, blank=True)
    delivery_notes = models.TextField(blank=True)
    pickup_date = models.DateTimeField(null=True, blank=True)
    pickup_location = models.CharField(max_length=200, blank=True)
    delivery_location = models.CharField(max_length=200, blank=True)
    shipment_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipment {self.tracking_number} - Order {self.order.order_number}"

    class Meta:
        verbose_name_plural = "Shipment Details"
