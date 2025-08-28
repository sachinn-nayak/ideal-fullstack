from django.contrib import admin
from .models import Product, Order, OrderItem, Customer, AdminUser, Category, ShipmentDetails


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']
    ordering = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active', 'brand', 'created_at']
    list_filter = ['category', 'is_active', 'brand', 'created_at']
    search_fields = ['name', 'description', 'brand', 'model']
    list_editable = ['price', 'stock', 'is_active']
    ordering = ['-created_at']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'created_at']
    search_fields = ['name', 'email', 'phone']
    ordering = ['-created_at']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer', 'total', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'customer__name', 'customer__email']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    ordering = ['-created_at']


@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'phone', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['user__username', 'user__email']
    ordering = ['-created_at']


@admin.register(ShipmentDetails)
class ShipmentDetailsAdmin(admin.ModelAdmin):
    list_display = ['order', 'shipment_method', 'driver_name', 'tracking_number', 'shipment_status', 'estimated_delivery']
    list_filter = ['shipment_method', 'shipment_status', 'created_at']
    search_fields = ['order__order_number', 'driver_name', 'tracking_number']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
