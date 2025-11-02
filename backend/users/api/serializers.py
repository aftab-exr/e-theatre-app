from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    # We add two password fields to confirm the password
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        # Fields to ask for during registration
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        """
        Check that the two passwords match.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})

        return attrs

    def create(self, validated_data):
        """
        Create and return a new user.
        """
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        
        # We use set_password to ensure it's hashed correctly
        user.set_password(validated_data['password'])
        user.save()
        
        return user