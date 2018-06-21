from .models import LifeSwitchType, LifeSwitchLog, TemporaryNote
from .serializers import LifeSwitchTypeSerializer, LifeSwitchLogSerializer, TemporaryNoteSerializer
from rest_framework import generics
from rest_framework import permissions


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

