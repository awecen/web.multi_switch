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


# 改善要望ステータス
class InquiryStatus(models.Model):
    status = models.CharField('ステータス', null=False, blank=False, max_length=255)

    def __str__(self):
        return self.status


# 改善要望概要
class Inquiry(models.Model):
    user = models.ForeignKey('auth.User', verbose_name='ユーザー', related_name='inquiries_by_user',
                             on_delete=models.CASCADE)
    target = models.TextField('場所', null=False, blank=False)
    status = models.ForeignKey(InquiryStatus, verbose_name='ステータス', related_name='inquiries_by_status',
                               on_delete=models.CASCADE)
    updated_time = models.DateTimeField('更新日時', default=datetime.now)
    created_time = models.DateTimeField('作成日時', default=datetime.now)

    def __str__(self):
        return 'Id: %s,  Status:%s' % (self.id, self.status, )


# 改善要望詳細
class InquiryDetail(models.Model):
    inquiry = models.ForeignKey(Inquiry, verbose_name='改善要望概要',
                                related_name='details_by_inquiry', on_delete=models.CASCADE)
    user = models.ForeignKey('auth.User', verbose_name='ユーザー', related_name='details_by_user',
                             on_delete=models.CASCADE)
    content = models.TextField('要望内容', null=False, blank=False)
    updated_time = models.DateTimeField('更新日時', default=datetime.now)
    created_time = models.DateTimeField('作成日時', default=datetime.now)


# ユーザー設定
class UserSetting(models.Model):
    user = models.ForeignKey('auth.User', verbose_name='ユーザー', related_name='user_settings_by_user', on_delete=models.CASCADE)
    child_name = models.CharField('名前', max_length=255)
    # 追加予定
