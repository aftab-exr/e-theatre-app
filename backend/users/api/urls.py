from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView, 
    TokenRefreshView,
    TokenBlacklistView
)

from .views import RegisterAPIView

urlpatterns = [
    # /auth/register
    path('register/', RegisterAPIView.as_view(), name='auth_register'),
    
    # /auth/login
    # This view is pre-built by Simple JWT
    # It expects 'username' and 'password'
    path('login/', TokenObtainPairView.as_view(), name='auth_login'),
    
    # /auth/logout
    # This view is pre-built and invalidates a refresh token
    path('logout/', TokenBlacklistView.as_view(), name='auth_logout'),
    
    # /auth/token/refresh
    # This gets a new access token using a refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]