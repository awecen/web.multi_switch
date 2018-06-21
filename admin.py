from django.contrib import admin
from .models import LifeSwitchType, LifeSwitchLog, TemporaryNote


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


# 登録
admin.site.register(LifeSwitchType, LifeSwitchTypeAdmin)
admin.site.register(LifeSwitchLog, LifeSwitchLogAdmin)
admin.site.register(TemporaryNote, TemporaryNoteAdmin)
