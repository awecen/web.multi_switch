from django.db import models
from datetime import datetime
from django.contrib.auth.models import User


# マルチスイッチタイプ
class LifeSwitchType(models.Model):
    name = models.CharField('種類', max_length=255)
    is_on = models.BooleanField('オン・オフ', default=False)

    def __str__(self):
        return self.name + ' / ' + ("ON" if self.is_on else "OFF")


# マルチスイッチログ
class LifeSwitchLog(models.Model):
    switch_time = models.DateTimeField('時間', default=datetime.now)
    type = models.ForeignKey(LifeSwitchType, verbose_name='スイッチタイプ', related_name='log_by_type', on_delete=models.CASCADE)
    note = models.TextField('メモ', null=True, blank=True)


# 一時メモ保管場所
class TemporaryNote(models.Model):
    type = models.ForeignKey(LifeSwitchType, verbose_name='スイッチタイプ', related_name='temporary_note_by_type',
                             on_delete=models.CASCADE)
    note = models.TextField('メモ', null=True, blank=True)


# ユーザー設定
class UserSetting(models.Model):
    user = models.ForeignKey('auth.User', verbose_name='ユーザー', related_name='user_settings_by_user', on_delete=models.CASCADE)
    child_name = models.CharField('名前', max_length=255)
    # 追加予定
