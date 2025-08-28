from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Order, OrderItem, Customer, AdminUser, Category, Payment, OnlinePayment, OfflinePayment, CODPayment, Address
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'wholesale_price', 'category', 'images', 'stock', 'is_active', 'brand', 'model', 'color', 'created_at']


class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'address_type', 'street_address', 'city', 'state', 'zip_code', 'country', 'is_default', 'created_at']


class CustomerSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    default_billing_address = serializers.SerializerMethodField()
    default_shipping_address = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'address', 'addresses', 'default_billing_address', 'default_shipping_address', 'created_at', 'updated_at']

    def get_default_billing_address(self, obj):
        billing_address = obj.get_default_billing_address()
        return AddressSerializer(billing_address).data if billing_address else None

    def get_default_shipping_address(self, obj):
        shipping_address = obj.get_default_shipping_address()
        return AddressSerializer(shipping_address).data if shipping_address else None


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderItemListSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_image', 'quantity', 'price', 'total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemListSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    billing_address = AddressSerializer(read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    order_number = serializers.CharField(read_only=True)  # Make order_number read-only

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'total', 'status', 'payment_status', 
            'payment_method', 'advance_amount', 'advance_verified', 'billing_address', 
            'shipping_address', 'shipping_address_text', 'shipping_city', 'shipping_state', 
            'shipping_zip_code', 'shipping_country', 'tracking_number', 'estimated_delivery', 
            'created_at', 'updated_at', 'items', 'customer_name', 'customer_email'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'customer_name', 'customer_email', 'total', 'status', 'payment_status', 'payment_method', 'created_at', 'items_count']

    def get_items_count(self, obj):
        try:
            # Use the reverse relationship directly
            return OrderItem.objects.filter(order=obj).count()
        except Exception as e:
            print(f"Error getting items count for order {obj.id}: {e}")
            return 0


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemListSerializer(many=True, read_only=True)
    customer = CustomerSerializer(read_only=True)
    billing_address = AddressSerializer(read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    order_number = serializers.CharField(read_only=True)  # Make order_number read-only

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'total', 'status', 'payment_status', 
            'payment_method', 'advance_amount', 'advance_verified', 'billing_address', 
            'shipping_address', 'shipping_address_text', 'shipping_city', 'shipping_state', 
            'shipping_zip_code', 'shipping_country', 'tracking_number', 'estimated_delivery', 
            'created_at', 'updated_at', 'items'
        ]


class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status', 'payment_status', 'tracking_number', 'estimated_delivery']


class AdminUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AdminUser
        fields = ['id', 'username', 'email', 'role', 'is_active', 'last_login', 'created_at']


class OnlinePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlinePayment
        fields = '__all__'


class OfflinePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfflinePayment
        fields = '__all__'


class CODPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CODPayment
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer.name', read_only=True)
    payment_method = serializers.CharField(read_only=True)
    payment_id = serializers.CharField(read_only=True)  # Make payment_id read-only
    
    # Include related payment details
    online_payment = OnlinePaymentSerializer(read_only=True)
    offline_payment = OfflinePaymentSerializer(read_only=True)
    cod_payment = CODPaymentSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'order', 'amount', 'payment_status', 'verified_by', 
            'verified_at', 'created_at', 'updated_at', 'order_number', 'customer_name', 
            'payment_method', 'online_payment', 'offline_payment', 'cod_payment'
        ]


class PaymentListSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer.name', read_only=True)
    payment_method = serializers.CharField(read_only=True)
    
    # Include basic payment method info
    transaction_id = serializers.SerializerMethodField()
    screenshot = serializers.SerializerMethodField()
    advance_amount = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = ['id', 'payment_id', 'order_number', 'customer_name', 'amount', 'payment_method', 'payment_status', 'transaction_id', 'screenshot', 'advance_amount', 'created_at']

    def get_transaction_id(self, obj):
        if hasattr(obj, 'onlinepayment'):
            return obj.onlinepayment.transaction_id
        return None

    def get_screenshot(self, obj):
        if hasattr(obj, 'offlinepayment'):
            return obj.offlinepayment.screenshot
        return None

    def get_advance_amount(self, obj):
        if hasattr(obj, 'codpayment'):
            return obj.codpayment.advance_amount
        return None


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# Dashboard serializers
class DashboardStatsSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    online_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    offline_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    cod_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_orders = serializers.IntegerField()
    delivered_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()
    verified_payments = serializers.IntegerField()
    pending_payments = serializers.IntegerField()
    failed_payments = serializers.IntegerField()
    low_stock_products = serializers.IntegerField()


class TopProductSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    total_sold = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)


class DashboardSerializer(serializers.Serializer):
    stats = DashboardStatsSerializer()
    recent_orders = serializers.SerializerMethodField()
    top_products = TopProductSerializer(many=True)
    
    def get_recent_orders(self, obj):
        orders = obj.get('recent_orders', [])
        return OrderListSerializer(orders, many=True).data


# Authentication Serializers
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom claims
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'name', 'phone', 'address')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Extract customer-specific fields
        name = validated_data.pop('name')
        phone = validated_data.pop('phone', '')
        address = validated_data.pop('address', '')
        password2 = validated_data.pop('password2')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Create customer profile
        Customer.objects.create(
            user=user,
            name=name,
            email=validated_data['email'],
            phone=phone,
            address=address
        )
        
        return user


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Customer
        fields = ['id', 'user', 'name', 'email', 'phone', 'address', 'created_at']

