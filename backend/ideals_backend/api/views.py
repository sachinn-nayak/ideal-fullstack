from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Product, Order, OrderItem, Customer, AdminUser, Category, Payment, OnlinePayment, OfflinePayment, CODPayment, Address
from .serializers import (
    ProductSerializer, ProductListSerializer, ProductDetailSerializer,
    OrderSerializer, OrderListSerializer, OrderDetailSerializer, OrderUpdateSerializer,
    CustomerSerializer, AdminUserSerializer, DashboardSerializer,
    CategorySerializer,PaymentListSerializer,PaymentSerializer,OnlinePayment,OnlinePaymentSerializer,OfflinePaymentSerializer,CODPaymentSerializer,CODPaymentSerializer,
    CustomTokenObtainPairSerializer, RegisterSerializer, CustomerProfileSerializer, AddressSerializer
)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for this viewset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action== 'destroy':
            return ProductDetailSerializer
        return ProductSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "product": serializer.data,
            "message": "Successfully retrieved product"
        })
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs) 
        
        print("response before:", response.data)  
        response.data = {
            "status_code": status.HTTP_302_FOUND,
            "message": "List of products",
            "results": response.data
        }
        return response
    

    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
        
        # Search by name or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(brand__icontains=search)
            )
        
        return queryset

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Product.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        threshold = int(self.request.query_params.get('threshold', 10))
        products = Product.objects.filter(stock__lt=threshold)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Process image field to convert newline-separated URLs to list
        data = serializer.validated_data
        if 'image' in data and isinstance(data['image'], str):
            # Split by newlines and filter out empty lines
            image_urls = [url.strip() for url in data['image'].split('\n') if url.strip()]
            data['images'] = image_urls
            del data['image']
        serializer.save()

    def perform_update(self, serializer):
        # Process image field to convert newline-separated URLs to list
        data = serializer.validated_data
        if 'image' in data and isinstance(data['image'], str):
            # Split by newlines and filter out empty lines
            image_urls = [url.strip() for url in data['image'].split('\n') if url.strip()]
            data['images'] = image_urls
            del data['image']
        serializer.save()


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for this viewset

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderDetailSerializer  # Use detail serializer to include items
        elif self.action == 'retrieve':
            return OrderDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "order": serializer.data,
            "message": "Order details retrieved"
        })
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs) 
        
        print("response before:", response.data)  
        response.data = {
            "status_code": status.HTTP_302_FOUND,
            "message": "List of orders",
            "results": response.data
        }
        return response

    def get_queryset(self):
        queryset = Order.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by payment status
        payment_status = self.request.query_params.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        # Search by order number or customer
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(order_number__icontains=search) |
                Q(customer__name__icontains=search) |
                Q(customer__email__icontains=search)
            )
        
        return queryset

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderUpdateSerializer(order, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def status_counts(self, request):
        counts = Order.objects.values('status').annotate(count=Count('id'))
        return Response(counts)

    @action(detail=False, methods=['get'])
    def payment_status_counts(self, request):
        counts = Order.objects.values('payment_status').annotate(count=Count('id'))
        return Response(counts)

    @action(detail=False, methods=['post'])
    def cleanup_pending_orders(self, request):
        """Clean up old pending orders (older than 1 hour)"""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_time = timezone.now() - timedelta(hours=1)
        old_pending_orders = Order.objects.filter(
            status='pending',
            payment_status='pending',
            created_at__lt=cutoff_time
        )
        
        count = old_pending_orders.count()
        old_pending_orders.delete()
        
        return Response({
            'message': f'Cleaned up {count} old pending orders'
        })

    def create(self, request, *args, **kwargs):
        try:
            # Extract items from request data
            items_data = request.data.pop('items', [])
            
            # Check if there's already a pending order for this customer with same items
            customer_id = request.data.get('customer')
            if customer_id:
                # Check for existing pending orders for this customer
                existing_pending_orders = Order.objects.filter(
                    customer_id=customer_id,
                    status='pending',
                    payment_status='pending'
                ).order_by('-created_at')
                
                # If there are recent pending orders (within last 30 minutes), return the latest one
                if existing_pending_orders.exists():
                    latest_pending = existing_pending_orders.first()
                    # Check if it's within 30 minutes
                    from django.utils import timezone
                    from datetime import timedelta
                    if latest_pending.created_at > timezone.now() - timedelta(minutes=30):
                        # Return existing order instead of creating new one
                        order_serializer = OrderDetailSerializer(latest_pending)
                        return Response({
                            'order': order_serializer.data,
                            'message': 'Using existing pending order'
                        }, status=status.HTTP_200_OK)
            
            # Create the order
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                order = serializer.save()
                
                # Create order items
                for item_data in items_data:
                    product = Product.objects.get(id=item_data['product'])
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=product.name,
                        product_image=product.images[0] if product.images else None,
                        quantity=item_data['quantity'],
                        price=item_data['price'],
                        total=item_data['quantity'] * item_data['price']
                    )
                
                # Return the created order with items
                order_serializer = OrderDetailSerializer(order)
                return Response({
                    'order': order_serializer.data,
                    'message': 'Order created successfully'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for this viewset

    def get_queryset(self):
        queryset = Customer.objects.all()
        
        # Search by name or email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(email__icontains=search)
            )
        
        return queryset


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = AdminUser.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated]


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # Calculate dashboard statistics
        total_products = Product.objects.filter(is_deleted=False).count()
        total_orders = Order.objects.count()
        total_customers = Customer.objects.count()
        
        # Revenue by payment method
        online_revenue = Order.objects.filter(
            payment_status='verified', 
            payment_method='online'
        ).aggregate(total=Sum('total'))['total'] or 0
        
        offline_revenue = Order.objects.filter(
            payment_status='verified', 
            payment_method='offline'
        ).aggregate(total=Sum('total'))['total'] or 0
        
        cod_revenue = Order.objects.filter(
            payment_status='verified', 
            payment_method='cod'
        ).aggregate(total=Sum('total'))['total'] or 0
        
        total_revenue = online_revenue + offline_revenue + cod_revenue
        
        # Order status counts
        pending_orders = Order.objects.filter(status='pending').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        cancelled_orders = Order.objects.filter(status='cancelled').count()
        
        # Payment status counts
        verified_payments = Order.objects.filter(payment_status='verified').count()
        pending_payments = Order.objects.filter(payment_status='pending').count()
        failed_payments = Order.objects.filter(payment_status='failed').count()
        
        low_stock_products = Product.objects.filter(stock__lt=10, is_deleted=False).count()

        # Recent orders (last 5)
        recent_orders = Order.objects.all()[:5]
        print(f"Recent orders count: {recent_orders.count()}")
        for order in recent_orders:
            print(f"Order {order.id}: {order.order_number}")
            try:
                items_count = order.items.count()
                print(f"  Items count: {items_count}")
            except Exception as e:
                print(f"  Error getting items count: {e}")

        # Top products (based on order items)
        top_products = OrderItem.objects.values(
            'product__id', 'product__name'
        ).annotate(
            total_sold=Sum('quantity'),
            revenue=Sum('total')
        ).order_by('-total_sold')[:5]

        # Format top products data
        top_products_data = []
        for item in top_products:
            top_products_data.append({
                'product_id': item['product__id'],
                'product_name': item['product__name'],
                'total_sold': item['total_sold'],
                'revenue': float(item['revenue'])
            })

        data = {
            'stats': {
                'total_products': total_products,
                'total_orders': total_orders,
                'total_customers': total_customers,
                'total_revenue': total_revenue,
                'online_revenue': online_revenue,
                'offline_revenue': offline_revenue,
                'cod_revenue': cod_revenue,
                'pending_orders': pending_orders,
                'delivered_orders': delivered_orders,
                'cancelled_orders': cancelled_orders,
                'verified_payments': verified_payments,
                'pending_payments': pending_payments,
                'failed_payments': failed_payments,
                'low_stock_products': low_stock_products,
            },
            'recent_orders': recent_orders,
            'top_products': top_products_data
        }

        serializer = DashboardSerializer(instance=data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def revenue_chart(self, request):
        # Get revenue for last 7 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=7)
        
        daily_revenue = []
        current_date = start_date
        
        while current_date <= end_date:
            day_revenue = Order.objects.filter(
                payment_status='paid',
                created_at__date=current_date.date()
            ).aggregate(total=Sum('total'))['total'] or 0
            
            daily_revenue.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'revenue': float(day_revenue)
            })
            
            current_date += timedelta(days=1)
        
        return Response(daily_revenue)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer

    def get_queryset(self):
        queryset = Payment.objects.all()
        
        # Filter by payment method
        payment_method = self.request.query_params.get('payment_method', None)
        if payment_method:
            if payment_method == 'online':
                queryset = queryset.filter(onlinepayment__isnull=False)
            elif payment_method == 'offline':
                queryset = queryset.filter(offlinepayment__isnull=False)
            elif payment_method == 'cod':
                queryset = queryset.filter(codpayment__isnull=False)
        
        # Filter by payment status
        payment_status = self.request.query_params.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        # Search by payment ID or order number
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(payment_id__icontains=search) |
                Q(order__order_number__icontains=search) |
                Q(order__customer__name__icontains=search)
            )
        
        return queryset

    @action(detail=True, methods=['patch'])
    def verify_payment(self, request, pk=None):
        payment = self.get_object()
        
        if payment.payment_status == 'verified':
            return Response({'error': 'Payment already verified'}, status=status.HTTP_400_BAD_REQUEST)
        
        payment.payment_status = 'verified'
        payment.verified_by = request.user
        payment.verified_at = timezone.now()
        payment.save()
        
        # Update order payment status
        order = payment.order
        order.payment_status = 'verified'
        order.save()
        
        return Response({'message': 'Payment verified successfully'})

    @action(detail=True, methods=['patch'])
    def reject_payment(self, request, pk=None):
        payment = self.get_object()
        
        if payment.payment_status == 'failed':
            return Response({'error': 'Payment already failed'}, status=status.HTTP_400_BAD_REQUEST)
        
        payment.payment_status = 'failed'
        payment.verified_by = request.user
        payment.verified_at = timezone.now()
        payment.save()
        
        # Update order payment status
        order = payment.order
        order.payment_status = 'failed'
        order.save()
        
        return Response({'message': 'Payment rejected successfully'})

    @action(detail=True, methods=['patch'])
    def verify_cod_advance(self, request, pk=None):
        """Verify COD advance payment"""
        payment = self.get_object()
        
        if not hasattr(payment, 'codpayment'):
            return Response({'error': 'This is not a COD payment'}, status=status.HTTP_400_BAD_REQUEST)
        
        if payment.codpayment.advance_verified:
            return Response({'error': 'Advance already verified'}, status=status.HTTP_400_BAD_REQUEST)
        
        payment.codpayment.advance_verified = True
        payment.codpayment.save()
        
        return Response({'message': 'COD advance verified successfully'})

    @action(detail=True, methods=['post'])
    def process_refund(self, request, pk=None):
        """Process refund for online payment"""
        payment = self.get_object()
        
        if not hasattr(payment, 'onlinepayment'):
            return Response({'error': 'This is not an online payment'}, status=status.HTTP_400_BAD_REQUEST)
        
        refund_amount = request.data.get('refund_amount', payment.amount)
        
        # Here you would integrate with payment gateway (Razorpay, etc.)
        # For now, we'll just update the status
        payment.onlinepayment.refund_amount = refund_amount
        payment.onlinepayment.refund_status = 'processed'
        payment.onlinepayment.save()
        
        return Response({'message': 'Refund processed successfully'})


class OnlinePaymentViewSet(viewsets.ModelViewSet):
    queryset = OnlinePayment.objects.all()
    serializer_class = OnlinePaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        queryset = OnlinePayment.objects.all()
        
        # Filter by gateway
        gateway = self.request.query_params.get('gateway', None)
        if gateway:
            queryset = queryset.filter(gateway=gateway)
        
        # Filter by refund status
        refund_status = self.request.query_params.get('refund_status', None)
        if refund_status:
            queryset = queryset.filter(refund_status=refund_status)
        
        return queryset


class OfflinePaymentViewSet(viewsets.ModelViewSet):
    queryset = OfflinePayment.objects.all()
    serializer_class = OfflinePaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        queryset = OfflinePayment.objects.all()
        
        # Filter by bank name
        bank_name = self.request.query_params.get('bank_name', None)
        if bank_name:
            queryset = queryset.filter(bank_name__icontains=bank_name)
        
        return queryset


class CODPaymentViewSet(viewsets.ModelViewSet):
    queryset = CODPayment.objects.all()
    serializer_class = CODPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        queryset = CODPayment.objects.all()
        
        # Filter by advance verification status
        advance_verified = self.request.query_params.get('advance_verified', None)
        if advance_verified is not None:
            queryset = queryset.filter(advance_verified=advance_verified.lower() == 'true')
        
        return queryset


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


# Authentication Views
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Please provide both username and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Get customer profile if it exists
        try:
            customer = Customer.objects.get(user=user)
            customer_data = {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'address': customer.address
            }
        except Customer.DoesNotExist:
            customer_data = None

        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'customer_id': customer_data['id'] if customer_data else None,
                'customer': customer_data
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        })


class CustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            customer = Customer.objects.get(user=request.user)
            serializer = CustomerProfileSerializer(customer)
            return Response(serializer.data)
        except Customer.DoesNotExist:
            return Response({
                'error': 'Customer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        try:
            customer = Customer.objects.get(user=request.user)
            serializer = CustomerProfileSerializer(customer, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Profile updated successfully',
                    'data': serializer.data
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Customer.DoesNotExist:
            return Response({
                'error': 'Customer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Logout successful'
            })
        except Exception as e:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            customer = Customer.objects.get(user=self.request.user)
            return Address.objects.filter(customer=customer)
        except Customer.DoesNotExist:
            return Address.objects.none()

    def perform_create(self, serializer):
        try:
            customer = Customer.objects.get(user=self.request.user)
            serializer.save(customer=customer)
        except Customer.DoesNotExist:
            raise serializers.ValidationError("Customer profile not found")

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        address = self.get_object()
        address.is_default = True
        address.save()
        return Response({
            'message': f'{address.get_address_type_display()} set as default'
        })

    @action(detail=False, methods=['get'])
    def billing(self, request):
        try:
            customer = Customer.objects.get(user=request.user)
            addresses = Address.objects.filter(customer=customer, address_type='billing')
            serializer = self.get_serializer(addresses, many=True)
            return Response(serializer.data)
        except Customer.DoesNotExist:
            return Response({
                'error': 'Customer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def shipping(self, request):
        try:
            customer = Customer.objects.get(user=request.user)
            addresses = Address.objects.filter(customer=customer, address_type='shipping')
            serializer = self.get_serializer(addresses, many=True)
            return Response(serializer.data)
        except Customer.DoesNotExist:
            return Response({
                'error': 'Customer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


import razorpay
import cloudinary
import cloudinary.uploader
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

# Configure Razorpay
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        try:
            customer = Customer.objects.get(user=self.request.user)
            return Payment.objects.filter(order__customer=customer)
        except Customer.DoesNotExist:
            return Payment.objects.none()

    @action(detail=False, methods=['post'])
    def create_razorpay_order(self, request):
        """Create Razorpay order for online payment"""
        try:
            amount = request.data.get('amount')
            currency = request.data.get('currency', 'INR')
            order_id = request.data.get('order_id')

            if not amount or not order_id:
                return Response({
                    'error': 'Amount and order_id are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create Razorpay order
            razorpay_order = razorpay_client.order.create({
                'amount': int(float(amount) * 100),  # Convert to paise
                'currency': currency,
                'receipt': f'order_{order_id}',
                'notes': {
                    'order_id': order_id
                }
            })

            return Response({
                'razorpay_order_id': razorpay_order['id'],
                'amount': amount,
                'currency': currency
            })

        except Exception as e:
            return Response({
                'error': f'Failed to create Razorpay order: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def verify_razorpay_payment(self, request):
        """Verify Razorpay payment signature"""
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            order_id = request.data.get('order_id')

            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id]):
                return Response({
                    'error': 'All payment parameters are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Verify signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }

            razorpay_client.utility.verify_payment_signature(params_dict)

            # Update payment status
            try:
                order = Order.objects.get(id=order_id)
                payment = Payment.objects.get(order=order)
                
                # Create online payment record
                OnlinePayment.objects.create(
                    payment=payment,
                    transaction_id=razorpay_payment_id,
                    gateway='razorpay',
                    gateway_response=params_dict
                )

                # Update payment status
                payment.payment_status = 'verified'
                payment.save()

                # Update order status
                order.payment_status = 'verified'
                order.status = 'processing'
                order.save()

                return Response({
                    'message': 'Payment verified successfully',
                    'payment_id': payment.payment_id
                })

            except (Order.DoesNotExist, Payment.DoesNotExist):
                return Response({
                    'error': 'Order or payment not found'
                }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                'error': f'Payment verification failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def upload_screenshot(self, request):
        """Upload payment screenshot for offline payment"""
        try:
            file = request.FILES.get('screenshot')
            payment_id = request.data.get('payment_id')

            if not file or not payment_id:
                return Response({
                    'error': 'Screenshot file and payment_id are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate file type
            if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
                return Response({
                    'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate file size
            if file.size > settings.MAX_UPLOAD_SIZE:
                return Response({
                    'error': 'File size too large. Maximum 5MB allowed'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file,
                folder='payment_screenshots',
                public_id=f'payment_{payment_id}_{int(timezone.now().timestamp())}'
            )

            # Update payment record
            try:
                payment = Payment.objects.get(payment_id=payment_id)
                
                # Create or update offline payment record
                offline_payment, created = OfflinePayment.objects.get_or_create(
                    payment=payment,
                    defaults={
                        'screenshot': upload_result['secure_url'],
                        'bank_name': request.data.get('bank_name', ''),
                        'transaction_reference': request.data.get('transaction_reference', '')
                    }
                )

                if not created:
                    offline_payment.screenshot = upload_result['secure_url']
                    offline_payment.bank_name = request.data.get('bank_name', '')
                    offline_payment.transaction_reference = request.data.get('transaction_reference', '')
                    offline_payment.save()

                return Response({
                    'message': 'Screenshot uploaded successfully',
                    'screenshot_url': upload_result['secure_url']
                })

            except Payment.DoesNotExist:
                return Response({
                    'error': 'Payment not found'
                }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                'error': f'Upload failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def verify_offline_payment(self, request, pk=None):
        """Verify offline payment (admin only)"""
        payment = self.get_object()
        
        if payment.payment_status != 'pending':
            return Response({
                'error': 'Payment is not pending verification'
            }, status=status.HTTP_400_BAD_REQUEST)

        payment.payment_status = 'verified'
        payment.verified_by = request.user
        payment.verified_at = timezone.now()
        payment.save()

        # Update order status
        order = payment.order
        order.payment_status = 'verified'
        order.status = 'processing'
        order.save()

        return Response({
            'message': 'Offline payment verified successfully'
        })

    @action(detail=True, methods=['post'])
    def reject_offline_payment(self, request, pk=None):
        """Reject offline payment (admin only)"""
        payment = self.get_object()
        
        if payment.payment_status != 'pending':
            return Response({
                'error': 'Payment is not pending verification'
            }, status=status.HTTP_400_BAD_REQUEST)

        payment.payment_status = 'failed'
        payment.verified_by = request.user
        payment.verified_at = timezone.now()
        payment.save()

        return Response({
            'message': 'Offline payment rejected'
        })

    @action(detail=True, methods=['post'])
    def verify_cod_advance(self, request, pk=None):
        """Verify COD advance payment"""
        payment = self.get_object()
        
        try:
            cod_payment = CODPayment.objects.get(payment=payment)
            
            if cod_payment.advance_verified:
                return Response({
                    'error': 'Advance payment already verified'
                }, status=status.HTTP_400_BAD_REQUEST)

            cod_payment.advance_verified = True
            cod_payment.save()

            # Update order
            order = payment.order
            order.advance_verified = True
            order.save()

            return Response({
                'message': 'COD advance payment verified successfully'
            })

        except CODPayment.DoesNotExist:
            return Response({
                'error': 'COD payment record not found'
            }, status=status.HTTP_404_NOT_FOUND)
