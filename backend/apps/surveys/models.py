from django.db import models

class CmsSurveymaster(models.Model):
    sur_id = models.AutoField(primary_key=True)
    sur_code = models.CharField(max_length=50)
    sur_title = models.TextField()
    sur_url = models.TextField(default='[]')  # JSON Survey Schema & Questions Tree
    sur_onlne_id = models.TextField(default='NCD-ONL')
    sur_pri_db_name = models.TextField(default='ncd')
    sur_pri_db_server = models.TextField(default='localhost')
    sur_pri_db_usrnme = models.TextField(default='root')
    sur_pri_db_paswrd = models.BinaryField(null=True, blank=True)
    sur_sec_db_name = models.TextField(null=True, blank=True)
    sur_sec_db_server = models.TextField(null=True, blank=True)
    sur_sec_db_usrnme = models.TextField(null=True, blank=True)
    sur_sec_db_paswrd = models.BinaryField(null=True, blank=True)
    status = models.CharField(max_length=1, default='1')
    create_time = models.IntegerField(null=True, blank=True)
    create_user = models.SmallIntegerField(null=True, blank=True)
    update_time = models.IntegerField(null=True, blank=True)
    update_user = models.SmallIntegerField(null=True, blank=True)
    record_date = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'cms_surveymaster'
        managed = False
        verbose_name = 'Survey Master'
        verbose_name_plural = 'Survey Masters'

    def __str__(self):
        return f"{self.sur_code} - {self.sur_title}"


class CmsFieldmaster(models.Model):
    field_id = models.AutoField(primary_key=True)
    field_name = models.CharField(max_length=100)
    field_label = models.CharField(max_length=255)
    field_type = models.CharField(max_length=50, default='text')
    options = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=1, default='1')

    class Meta:
        db_table = 'cms_fieldmaster'
        managed = False
        verbose_name = 'Field Master'
        verbose_name_plural = 'Field Masters'
