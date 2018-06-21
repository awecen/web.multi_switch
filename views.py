from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import generic
from .models import LifeSwitchLog


# Create your views here.
@method_decorator(login_required, name='dispatch')
class MainView(generic.ListView):
    model = LifeSwitchLog
    template_name = 'multi_switch/main.html'


@method_decorator(login_required, name='dispatch')
class LogsView(generic.ListView):
    model = LifeSwitchLog
    template_name = 'multi_switch/logs.html'


@method_decorator(login_required, name='dispatch')
class WhatsnewView(generic.ListView):
    model = LifeSwitchLog
    template_name = 'multi_switch/whatsnew.html'
