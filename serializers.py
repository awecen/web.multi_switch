from rest_framework import serializers
from .models import LifeSwitchLog, LifeSwitchType, TemporaryNote


class LifeSwitchTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifeSwitchType
        fields = '__all__'


class LifeSwitchLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifeSwitchLog
        fields = '__all__'


class TemporaryNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemporaryNote
        fields = '__all__'
