from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ProductViewSet, OrderViewSet, CustomerViewSet, 
    AdminUserViewSet, DashboardViewSet, CategoryViewSet, PaymentViewSet,
    OnlinePaymentViewSet, OfflinePaymentViewSet, CODPaymentViewSet,
    CustomTokenObtainPairView, RegisterView, LoginView, CustomerProfileView, LogoutView,
    AddressViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'admin-users', AdminUserViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'categories', CategoryViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'online-payments', OnlinePaymentViewSet)
router.register(r'offline-payments', OfflinePaymentViewSet)
router.register(r'cod-payments', CODPaymentViewSet)
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication URLs
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login-custom/', LoginView.as_view(), name='login'),
    path('auth/profile/', CustomerProfileView.as_view(), name='profile'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
]

