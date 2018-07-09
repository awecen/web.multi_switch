from rest_framework import serializers
from .models import LifeSwitchLog, LifeSwitchType, TemporaryNote, UserSetting, Inquiry, InquiryDetail, InquiryStatus
from django.contrib.auth.models import User


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


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = '__all__'


class InquiryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = InquiryDetail
        fields = '__all__'


class InquiryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = InquiryStatus
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'