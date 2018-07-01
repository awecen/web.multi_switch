from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import generic
from .models import LifeSwitchLog
from django.contrib.auth.models import User

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


@method_decorator(login_required, name='dispatch')
class StatView(generic.ListView):
    model = LifeSwitchLog
    template_name = 'multi_switch/stat.html'


@method_decorator(login_required, name='dispatch')
class InquiriesView(generic.ListView):
    model = LifeSwitchLog
    template_name = 'multi_switch/inquiries.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)  # はじめに継承元のメソッドを呼び出す
        context["admin_user_name"] = "管理者"
        context["user_id"] = self.request.user.id
        context["user_name"] = self.request.user
        return context


@method_decorator(login_required, name='dispatch')
class SettingsView(generic.ListView):
    model = LifeSwitchLog
    template_name = 'multi_switch/settings.html'
