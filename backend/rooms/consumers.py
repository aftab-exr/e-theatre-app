import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Room

class RoomConsumer(AsyncJsonWebsocketConsumer):
    """
    Handles WebSocket connections for a single Room.
    """

    async def connect(self):
        """
        Called when a user tries to connect via WebSocket.
        """
        # Get the room ID from the URL
        # The URL will be ws/rooms/[room_id]/
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'room_{self.room_id}'
        self.user = self.scope['user']

        # A user must be authenticated to connect
        if not self.user.is_authenticated:
            print("User is not authenticated. Closing connection.")
            await self.close()
            return
            
        # Check if the user is a member of this room
        if not await self.is_user_member():
            print(f"User {self.user} is not a member of room {self.room_id}. Closing.")
            await self.close()
            return

        # Join the room's channel group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()
        print(f"User {self.user} connected to room {self.room_id}")

    async def disconnect(self, close_code):
        """
        Called when the WebSocket connection is closed.
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"User {self.user} disconnected from room {self.room_id}")


    async def receive_json(self, content):
        """
        Called when a message is received from the WebSocket.
        'content' is automatically parsed from JSON.
        """
        msg_type = content.get('type')
        
        # --- Permission Check ---
        # We must check if the user is the host before accepting
        # playback commands (play, pause, seek).
        is_host = await self.is_user_host()
        
        if msg_type in ['play', 'pause', 'seek'] and not is_host:
            # Send an error message back to *only* this user
            await self.send_json({
                'type': 'error',
                'message': 'You are not the host, you cannot control playback.'
            })
            return

        # --- Database Update (Optional but good) ---
        # If this is a state-changing command, update the DB model
        if msg_type == 'play':
            await self.update_room_state('playing')
        elif msg_type == 'pause':
            await self.update_room_state('paused')
        elif msg_type == 'seek':
            await self.update_room_timestamp(content.get('time', 0.0))

        # --- Broadcast ---
        # Send the message to everyone else in the room's group.
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_message', # This calls the broadcast_message method below
                'payload': content,
                'sender_channel_name': self.channel_name # To avoid echo
            }
        )

    # --- Group Send Handlers ---

    async def broadcast_message(self, event):
        """
        This method is called when a message is sent to the group.
        It sends the message payload to this specific client (WebSocket).
        """
        payload = event['payload']
        
        # Don't send the message back to the original sender
        # (The React app can handle this, but it's good practice)
        if event['sender_channel_name'] != self.channel_name:
            await self.send_json(payload)


    # --- Async Database Helpers ---
    # We use @database_sync_to_async to safely access the
    # Django ORM from an async consumer.

    @database_sync_to_async
    def is_user_member(self):
        try:
            room = Room.objects.get(id=self.room_id)
            return self.user in room.members.all()
        except Room.DoesNotExist:
            return False

    @database_sync_to_async
    def is_user_host(self):
        try:
            room = Room.objects.get(id=self.room_id)
            return room.host == self.user
        except Room.DoesNotExist:
            return False

    @database_sync_to_async
    def update_room_state(self, state):
        Room.objects.filter(id=self.room_id).update(playback_state=state)

    @database_sync_to_async
    def update_room_timestamp(self, time):
        Room.objects.filter(id=self.room_id).update(current_timestamp=time)