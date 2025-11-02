from django.contrib import admin
from django.urls import path, include # Make sure 'include' is imported

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Add our new user auth endpoints
    # All URLs will be prefixed with /auth/
    path('auth/', include('users.api.urls')),
    
    # We will add our 'rooms' app API URLs here next
    path('api/', include('rooms.api.urls')), 
]