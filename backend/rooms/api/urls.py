from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet

# Create a router and register our viewset with it.
router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')

# The API URLs are now determined automatically by the router.
# e.g., /api/rooms/
# e.g., /api/rooms/[room_id]/
urlpatterns = [
    path('', include(router.urls)),
]