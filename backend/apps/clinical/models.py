from django.db import models

class CmsCchv(models.Model):
    """Community Health Survey primary form table (246 records)"""
    clientid = models.CharField(max_length=64, primary_key=True)
    cchv_state = models.CharField(max_length=50, null=True, blank=True)
    cchv_loc = models.CharField(max_length=50, null=True, blank=True)
    cchv_date = models.IntegerField(null=True, blank=True)
    cchv_fname = models.CharField(max_length=100, null=True, blank=True)
    cchv_age = models.IntegerField(null=True, blank=True)
    cchv_gender = models.CharField(max_length=20, null=True, blank=True)
    cchv_contact = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=1, default='1')

    class Meta:
        db_table = 'cms_cchv'
        managed = False
        verbose_name = 'Community Health Survey Record'
        verbose_name_plural = 'Community Health Survey Records'


class CmsMdhl(models.Model):
    """Screening & Linkage Survey master record table"""
    mem_scrn_id = models.AutoField(primary_key=True)
    mem_scrn_survey = models.CharField(max_length=50, default='NCD')
    mem_scrn_loc = models.CharField(max_length=50, default='Dharavi')
    mem_scrn_date = models.IntegerField(null=True, blank=True)
    mem_scrn_part_id = models.CharField(max_length=100, unique=True)
    mem_scrn_q1 = models.IntegerField(null=True, blank=True)  # Age
    mem_scrn_q2 = models.CharField(max_length=50, null=True, blank=True)  # Gender
    mem_scrn_q16 = models.CharField(max_length=255, null=True, blank=True) # Full Name
    mem_scrn_q17 = models.CharField(max_length=100, null=True, blank=True) # Location
    mem_scrn_q24 = models.IntegerField(default=0) # Eligible (1/0)
    mem_scrn_q25 = models.IntegerField(default=0) # Enrolled (1/0)
    mem_scrn_q30 = models.TextField(null=True, blank=True) # JSON store
    status = models.CharField(max_length=1, default='1')
    create_time = models.IntegerField(null=True, blank=True)
    update_time = models.IntegerField(null=True, blank=True)
    record_date = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'cms_mdhl'
        managed = False
        verbose_name = 'MDHL Screening Record'
        verbose_name_plural = 'MDHL Screening Records'


class CmsApm(models.Model):
    id = models.AutoField(primary_key=True)
    apm_pid = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_apm'
        managed = False

class CmsBsr(models.Model):
    id = models.AutoField(primary_key=True)
    bsr_pid = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_bsr'
        managed = False

class CmsCe(models.Model):
    id = models.AutoField(primary_key=True)
    ce_pid = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_ce'
        managed = False

class CmsCml(models.Model):
    id = models.AutoField(primary_key=True)
    cml_pid = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_cml'
        managed = False

class CmsCprca(models.Model):
    id = models.AutoField(primary_key=True)
    cprca_pid = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_cprca'
        managed = False

class CmsDg(models.Model):
    id = models.AutoField(primary_key=True)
    dg_pid = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_dg'
        managed = False

class CmsFupm(models.Model):
    id = models.AutoField(primary_key=True)
    fupm_pid = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_fupm'
        managed = False

class CmsVital(models.Model):
    id = models.AutoField(primary_key=True)
    vital_pid = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_vital'
        managed = False

class CmsMortalityform(models.Model):
    id = models.AutoField(primary_key=True)
    participant_id = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_mortalityform'
        managed = False

class CmsTrackingform(models.Model):
    id = models.AutoField(primary_key=True)
    participant_id = models.CharField(max_length=64, null=True, blank=True)
    class Meta:
        db_table = 'cms_trackingform'
        managed = False
