from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .serializers import RegisterSerializer

class RegisterAPIView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    POST /auth/register
    """
    queryset = User.objects.all()
    # Allow any user (even unauthenticated) to access this endpoint
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        return Response(
            {"message": f"User {user.username} created successfully."}, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

    def perform_create(self, serializer):
        return serializer.save()