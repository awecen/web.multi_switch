from .models import LifeSwitchType, LifeSwitchLog, TemporaryNote, UserSetting
from .serializers import LifeSwitchTypeSerializer, LifeSwitchLogSerializer, TemporaryNoteSerializer, UserSettingSerializer
from rest_framework import generics
from rest_framework import permissions
from rest_framework import mixins


class LifeSwitchLogList(generics.ListCreateAPIView):
    """
    List all Life Switch Logs
    """
    queryset = LifeSwitchLog.objects.all().order_by('-switch_time')
    serializer_class = LifeSwitchLogSerializer
    permission_classes = (permissions.IsAuthenticated,)


class LifeSwitchLogDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve a Life Switch Log
    """
    queryset = LifeSwitchLog.objects.all()
    serializer_class = LifeSwitchLogSerializer
    permission_classes = (permissions.IsAuthenticated,)


class TemporaryNoteList(generics.ListCreateAPIView):
    """
    List all Temporary Notes
    """
    queryset = TemporaryNote.objects.all()
    serializer_class = TemporaryNoteSerializer
    permission_classes = (permissions.IsAuthenticated,)


class TemporaryNoteDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve a Temporary Note
    """
    queryset = TemporaryNote.objects.all()
    serializer_class = TemporaryNoteSerializer
    permission_classes = (permissions.IsAuthenticated,)


class LifeSwitchTypeList(generics.ListAPIView):
    """
    List all Life Switch Type
    """
    queryset = LifeSwitchType.objects.all()
    serializer_class = LifeSwitchTypeSerializer
    permission_classes = (permissions.IsAuthenticated,)


class UserSettingList(generics.ListAPIView):
    """
    Retrieve a User Setting
    """
    serializer_class = UserSettingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """
        This view should return a list of all the usersetting
        for the currently authenticated user.
        """
        user = self.request.user
        return UserSetting.objects.filter(user=user)


class UserSettingDetail(generics.RetrieveUpdateAPIView):
    """
    Retrieve a User Setting
    """
    serializer_class = UserSettingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """
        This view should return a list of all the usersetting
        for the currently authenticated user.
        """
        user = self.request.user
        return UserSetting.objects.filter(user=user)

