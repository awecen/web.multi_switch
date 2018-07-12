from django.contrib import admin
from .models import LifeSwitchType, LifeSwitchLog, TemporaryNote, \
    UserSetting, InquiryStatus, Inquiry, InquiryDetail


# マルチスイッチ タイプ
class LifeSwitchTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_on')
    list_display_links = ('id', 'name', )
    ordering = ('id', )


# マルチスイッチ ログ
class LifeSwitchLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'switch_time', 'type', 'note', )
    list_display_links = ('id', )
    ordering = ('-switch_time', )


# マルチスイッチ 一時メモ
class TemporaryNoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'note', )
    list_display_links = ('id', )
    ordering = ('id', )


# ユーザー設定
class UserSettingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'child_name', )
    list_display_links = ('id', )
    ordering = ('id', )


class InquiryStatusAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'status_en', )
    list_display_links = ('id', 'status', )
    ordering = ('id', )


class InquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'target', 'status', 'updated_time', 'created_time', )
    list_display_links = ('id', )
    ordering = ('id', )


class InquiryDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'inquiry', 'content', 'updated_time', 'created_time', )
    list_display_links = ('id', )
    ordering = ('id', )


# 登録
admin.site.register(LifeSwitchType, LifeSwitchTypeAdmin)
admin.site.register(LifeSwitchLog, LifeSwitchLogAdmin)
admin.site.register(TemporaryNote, TemporaryNoteAdmin)
admin.site.register(InquiryStatus, InquiryStatusAdmin)
admin.site.register(Inquiry, InquiryAdmin)
admin.site.register(InquiryDetail, InquiryDetailAdmin)
admin.site.register(UserSetting, UserSettingAdmin)
