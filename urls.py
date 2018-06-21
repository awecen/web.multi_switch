from django.urls import path
from . import views
from . import apis
from rest_framework.urlpatterns import format_suffix_patterns

# from rest_framework import routers
# from .apis import AnswerViewSet

# set the application namespace
# https://docs.djangoproject.com/ja/2.0/intro/tutorial03/
app_name = 'multi_switch'

urlpatterns = [
    # 通常ページ : (/)
    path('', views.MainView.as_view(), name='main'),
    path('logs/', views.LogsView.as_view(), name='main'),
    path('whatsnew/', views.WhatsnewView.as_view(), name='main'),

    # API
    path('api/log_list/', apis.LifeSwitchLogList.as_view()),
    path('api/log_list/<int:pk>/', apis.LifeSwitchLogDetail.as_view()),
    path('api/note_list/', apis.TemporaryNoteList.as_view()),
    path('api/note_list/<int:pk>/', apis.TemporaryNoteDetail.as_view()),
    path('api/switch_type_list/', apis.LifeSwitchTypeList.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)