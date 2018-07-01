from .models import LifeSwitchType, LifeSwitchLog, TemporaryNote, UserSetting, Inquiry, InquiryDetail
from .serializers import LifeSwitchTypeSerializer, LifeSwitchLogSerializer, TemporaryNoteSerializer, UserSettingSerializer, InquirySerializer, InquiryDetailSerializer, UserSerializer
from django.db.models import Q
from rest_framework import generics
from rest_framework import permissions
from rest_framework import mixins
from django.contrib.auth.models import User

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


class InquiryList(generics.ListCreateAPIView):
    """
    Retrieve Inquiry List
    """
    serializer_class = InquirySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """
        This view should return a list of all the inquiry
        for the currently authenticated user.
        """
        user = self.request.user
        user_id = self.request.user.id
        if user_id == 1:
            return Inquiry.objects.all().order_by('-updated_time')

        return Inquiry.objects.filter(user__in=[user, 1]).order_by('-updated_time')


class InquiryDetailList(generics.ListCreateAPIView):
    """
    Retrieve Inquiry Detail List
    """
    serializer_class = InquiryDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """
        This view should return a list of all the inquiry
        for the currently authenticated user.
        """
        user = self.request.user
        user_id = self.request.user.id
        inquiry = self.request.query_params.get('inquiry', None)

        if inquiry == "0":
            if user_id == 1:
                return InquiryDetail.objects.all()
            else:
                return InquiryDetail.objects.filter(user__in=[user, 1])
        else:
            if user_id == 1:
                return InquiryDetail.objects.filter(inquiry=inquiry)
            else:
                return InquiryDetail.objects.filter(inquiry=inquiry).filter(user__in=[user, 1])


class UserList(generics.ListAPIView):
    """
    Retrieve Inquiry Detail List
    """
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        user_id = self.request.user.id
        if user_id == 1:
            return User.objects.all()
