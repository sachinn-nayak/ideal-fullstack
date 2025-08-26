from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Product, Order, OrderItem, Customer, AdminUser, Category
from .serializers import (
    ProductSerializer, ProductListSerializer, ProductDetailSerializer,
    OrderSerializer, OrderListSerializer, OrderDetailSerializer, OrderUpdateSerializer,
    CustomerSerializer, AdminUserSerializer, DashboardSerializer,
    CategorySerializer
)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
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


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
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


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(payment_status='paid').aggregate(
            total=Sum('total')
        )['total'] or 0
        pending_orders = Order.objects.filter(status='pending').count()
        low_stock_products = Product.objects.filter(stock__lt=10).count()

        # Recent orders (last 5)
        recent_orders = Order.objects.all()[:5]

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
                'total_revenue': total_revenue,
                'pending_orders': pending_orders,
                'low_stock_products': low_stock_products,
            },
            'recent_orders': OrderListSerializer(recent_orders, many=True).data,
            'top_products': top_products_data
        }

        serializer = DashboardSerializer(data)
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


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
