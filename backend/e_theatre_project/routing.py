from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import rooms.routing

# This is our main application
application = ProtocolTypeRouter({
    
    # 1. Standard HTTP requests
    # This is the "normal" Django part for our DRF API
    "http": get_asgi_application(),

    # 2. WebSocket requests
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack( # This adds the 'user' object to our scope
            URLRouter(
                # This points to our app-level routing file
                rooms.routing.websocket_urlpatterns
            )
        )
    ),
})