from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # This regex matches the WebSocket URL
    # ws/rooms/UNIQUE_ROOM_ID/
    re_path(r'ws/rooms/(?P<room_id>[\w-]+)/$', consumers.RoomConsumer.as_asgi()),
]