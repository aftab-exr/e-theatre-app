import uuid
from django.db import models
from django.conf import settings # Best practice to import User model

# This is the User model Django uses
User = settings.AUTH_USER_MODEL

class Room(models.Model):
    """
    Represents a single "E-Theatre" room.
    """
    
    # Enum for playback state
    class PlaybackState(models.TextChoices):
        PLAYING = 'playing', 'Playing'
        PAUSED = 'paused', 'Paused'

    # A unique, shareable ID for the room (e.g., /api/rooms/abc-123/)
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # The host who controls the room
    host = models.ForeignKey(
        User, 
        related_name='hosted_rooms', 
        on_delete=models.CASCADE
    )
    
    # All users currently in the room (including host)
    members = models.ManyToManyField(
        User, 
        related_name='joined_rooms', 
        blank=True
    )
    
    # A human-readable name for the room
    name = models.CharField(max_length=255, default="New Theatre Room")
    
    # This would be the stream URL provided by the Media Server
    current_video_url = models.URLField(
        max_length=500, 
        blank=True, 
        null=True
    )
    
    # The synchronized playback state
    playback_state = models.CharField(
        max_length=10,
        choices=PlaybackState.choices,
        default=PlaybackState.PAUSED
    )
    
    # The synchronized timestamp (in seconds)
    current_timestamp = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room: {self.name} (Host: {self.host.username})"