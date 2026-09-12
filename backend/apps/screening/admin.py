from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CmsScreening

@admin.register(CmsScreening)
class CmsScreeningAdmin(ModelAdmin):
    list_display = ('mem_scrn_id', 'mem_scrn_part_id', 'mem_scrn_q16', 'mem_scrn_q1', 'mem_scrn_q2', 'mem_scrn_loc', 'mem_scrn_q24', 'status')
    search_fields = ('mem_scrn_part_id', 'mem_scrn_q16', 'mem_scrn_loc')
    list_filter = ('mem_scrn_survey', 'mem_scrn_loc', 'mem_scrn_q24', 'status')
    ordering = ('-mem_scrn_id',)
