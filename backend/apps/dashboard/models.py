from django.db import models

class VFormstatus(models.Model):
    client_id = models.CharField(max_length=64, primary_key=True)
    cchv = models.IntegerField()
    dg = models.IntegerField()
    apm = models.IntegerField()
    bsr = models.IntegerField()
    ce = models.IntegerField()
    cml = models.IntegerField()
    cprca = models.IntegerField()
    fupm = models.IntegerField()
    mdhl = models.IntegerField()
    vital = models.IntegerField()

    class Meta:
        db_table = 'v_formstatus'
        managed = False


class VFormsummary(models.Model):
    dg = models.BigIntegerField(primary_key=True)
    apm = models.BigIntegerField()
    bsr = models.BigIntegerField()
    ce = models.BigIntegerField()
    cml = models.BigIntegerField()
    cprca = models.BigIntegerField()
    fupm = models.BigIntegerField()
    mdhl = models.BigIntegerField()
    vital = models.BigIntegerField()

    class Meta:
        db_table = 'v_formsummary'
        managed = False
