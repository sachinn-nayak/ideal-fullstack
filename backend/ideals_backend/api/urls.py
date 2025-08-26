from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, OrderViewSet, CustomerViewSet, 
    AdminUserViewSet, DashboardViewSet, CategoryViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'admin-users', AdminUserViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

