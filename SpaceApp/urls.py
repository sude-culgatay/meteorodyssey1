from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name='home'),
    path("explore/", views.explore, name='explore'),
    path("game/", views.game, name='game'),
    path("game/questions/", views.game_questions, name='game_questions'),
    path("simulator/", views.simulator, name='simulator'),
    path("details/<int:asteroid_id>/", views.details, name='details'),
    path("chat/api/message/", views.chat_api, name='chat_api'),
    path("videos/", views.videos, name='videos'),
]