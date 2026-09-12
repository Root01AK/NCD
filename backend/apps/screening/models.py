from django.db import models

class CmsScreening(models.Model):
    mem_scrn_id = models.AutoField(primary_key=True)
    mem_scrn_survey = models.CharField(max_length=50, default='NCD')
    mem_scrn_loc = models.CharField(max_length=50, default='Dharavi')
    mem_scrn_date = models.IntegerField(null=True, blank=True)
    mem_scrn_part_id = models.CharField(max_length=100, unique=True)
    mem_scrn_q1 = models.IntegerField(null=True, blank=True) # Age
    mem_scrn_q2 = models.CharField(max_length=50, null=True, blank=True) # Gender (1=Male, 2=Female, 3=Transgender)
    mem_scrn_q16 = models.CharField(max_length=255, null=True, blank=True) # Full Name
    mem_scrn_q17 = models.CharField(max_length=100, null=True, blank=True) # Location
    mem_scrn_q24 = models.IntegerField(default=0) # Eligible
    mem_scrn_q25 = models.IntegerField(default=0) # Enrolled
    mem_scrn_q30 = models.TextField(null=True, blank=True) # Full Survey JSON Payload Store
    status = models.CharField(max_length=1, default='1')
    create_time = models.IntegerField(null=True, blank=True)
    update_time = models.IntegerField(null=True, blank=True)
    record_date = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'cms_screening'
        managed = False
        verbose_name = 'Participant Screening'
        verbose_name_plural = 'Participant Screenings'

    def __str__(self):
        return f"{self.mem_scrn_part_id} - {self.mem_scrn_q16}"
