from rest_framework import serializers
from .models import LifeSwitchLog, LifeSwitchType, TemporaryNote, UserSetting


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


class UserSettingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = UserSetting
        fields = '__all__'
