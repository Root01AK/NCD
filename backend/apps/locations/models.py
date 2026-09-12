from django.db import models

class CmsLocationmaster(models.Model):
    loc_id = models.AutoField(primary_key=True)
    state_code = models.CharField(max_length=10, default='MH')
    loc_code = models.CharField(max_length=20, unique=True)
    loc_name = models.CharField(max_length=255)
    status = models.CharField(max_length=1, default='1')
    del_status = models.IntegerField(default=0)
    create_time = models.IntegerField(null=True, blank=True)
    create_user = models.IntegerField(null=True, blank=True)
    update_time = models.IntegerField(null=True, blank=True)
    update_user = models.IntegerField(null=True, blank=True)
    record_date = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'cms_locationmaster'
        managed = False
        verbose_name = 'Location Master'
        verbose_name_plural = 'Location Masters'

    def __str__(self):
        return f"{self.loc_code} - {self.loc_name}"

    @property
    def loc_city(self):
        return self.loc_name

    @property
    def loc_district(self):
        return 'Mumbai'

    @property
    def loc_state(self):
        return 'Maharashtra'


class CmsStatemaster(models.Model):
    state_id = models.AutoField(primary_key=True)
    state_code = models.CharField(max_length=10, unique=True)
    state_name = models.CharField(max_length=100)
    status = models.CharField(max_length=1, default='1')

    class Meta:
        db_table = 'cms_statemaster'
        managed = False


class CmsLocationmapping(models.Model):
    id = models.AutoField(primary_key=True)
    loc_id = models.IntegerField()
    user_id = models.IntegerField()

    class Meta:
        db_table = 'cms_locationmapping'
        managed = False
