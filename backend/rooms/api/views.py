from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rooms.models import Room
from .serializers import RoomSerializer, CreateRoomSerializer

# --- Placeholder for Media Server Logic ---
# In a real app, this would use the LiveKit, Agora, or Mediasoup SDK
# to generate a secure, time-limited token.
def generate_media_server_token(user, room_id, is_host=False):
    print(f"[MediaToken] Generating token for User {user.id} in Room {room_id} (Host: {is_host})")
    # Example:
    # token = AccessToken('api-key', 'api-secret', identity=user.username)
    # grant = VideoGrant(room=room_id)
    # token.add_grant(grant)
    # return token.to_jwt()
    
    # We'll return a fake token for now
    return f"fake-media-server-token-for-{user.username}-room-{room_id}"
# --- End Placeholder ---


class RoomViewSet(viewsets.ModelViewSet):
    """
    API Endpoints for managing E-Theatre Rooms.
    Provides:
    - POST /api/rooms/ (Create a new room)
    - GET /api/rooms/[room_id]/ (Get room details)
    - POST /api/rooms/[room_id]/join/ (Join a room)
    - POST /api/rooms/[room_id]/start_stream/ (Host gets token)
    - GET /api/rooms/[room_id]/join_stream/ (Viewer gets token)
    """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # Use the UUID 'id' for lookups

    def get_serializer_class(self):
        """
        Use 'CreateRoomSerializer' for the 'create' action,
        and 'RoomSerializer' for all other actions.
        """
        if self.action == 'create':
            return CreateRoomSerializer
        return RoomSerializer

    def perform_create(self, serializer):
        """
        Called when creating a new room.
        We set the request user as the host.
        """
        room = serializer.save(host=self.request.user)
        # Automatically add the host to the members list
        room.members.add(self.request.user)

    @action(detail=True, methods=['post'], url_path='join')
    def join_room(self, request, id=None):
        """
        API endpoint for a user to join a room.
        POST /api/rooms/[room_id]/join
        """
        room = self.get_object()
        user = request.user
        
        if user in room.members.all():
            return Response(
                {'detail': 'User already in this room.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        room.members.add(user)
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='start-stream')
    def start_stream(self, request, id=None):
        """
        Generates a "host" token for the media server.
        POST /api/rooms/[room_id]/start-stream
        """
        room = self.get_object()
        user = request.user

        # Security Check: Only the host can start the stream
        if room.host != user:
            return Response(
                {'detail': 'Only the host can start the stream.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        token = generate_media_server_token(user, str(room.id), is_host=True)
        return Response({'media_token': token}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='join-stream')
    def join_stream(self, request, id=None):
        """
        Generates a "viewer" token for the media server.
        GET /api/rooms/[room_id]/join-stream
        """
        room = self.get_object()
        user = request.user

        # Security Check: Must be a member to get a stream token
        if user not in room.members.all():
            return Response(
                {'detail': 'You must join the room to view the stream.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        token = generate_media_server_token(user, str(room.id), is_host=False)
        return Response({'media_token': token}, status=status.HTTP_200_OK)