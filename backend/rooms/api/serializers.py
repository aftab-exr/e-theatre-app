from django.contrib.auth.models import User
from rest_framework import serializers
from rooms.models import Room

class UserSerializer(serializers.ModelSerializer):
    """
    A simple serializer for basic user info.
    We'll use this to show who is in the room.
    """
    class Meta:
        model = User
        fields = ('id', 'username')


class RoomSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving Room details.
    """
    # We use the UserSerializer to show nested user details
    host = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = (
            'id', 
            'name',
            'host', 
            'members', 
            'current_video_url', 
            'playback_state', 
            'current_timestamp',
            'created_at'
        )
        # These fields are set automatically by the server,
        # not by the user in a request.
        read_only_fields = ('id', 'host', 'members', 'created_at')

class CreateRoomSerializer(serializers.ModelSerializer):
    """
    A separate, simple serializer just for creating a room.
    We only need the 'name' from the user.
    """
    class Meta:
        model = Room
        fields = ('name',)