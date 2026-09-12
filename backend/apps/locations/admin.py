from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CmsLocationmaster, CmsStatemaster, CmsLocationmapping

@admin.register(CmsLocationmaster)
class CmsLocationmasterAdmin(ModelAdmin):
    list_display = ('loc_id', 'loc_code', 'loc_name', 'state_code', 'status')
    search_fields = ('loc_code', 'loc_name')
    list_filter = ('state_code', 'status')
    ordering = ('loc_id',)

@admin.register(CmsStatemaster)
class CmsStatemasterAdmin(ModelAdmin):
    list_display = ('state_id', 'state_code', 'state_name', 'status')
    search_fields = ('state_code', 'state_name')
    list_filter = ('status',)

@admin.register(CmsLocationmapping)
class CmsLocationmappingAdmin(ModelAdmin):
    list_display = ('id', 'loc_id', 'user_id')
