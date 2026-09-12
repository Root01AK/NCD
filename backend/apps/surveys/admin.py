from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CmsSurveymaster, CmsFieldmaster

@admin.register(CmsSurveymaster)
class CmsSurveymasterAdmin(ModelAdmin):
    list_display = ('sur_id', 'sur_code', 'sur_title', 'status', 'sur_onlne_id')
    search_fields = ('sur_code', 'sur_title')
    list_filter = ('status',)
    ordering = ('sur_id',)

@admin.register(CmsFieldmaster)
class CmsFieldmasterAdmin(ModelAdmin):
    list_display = ('field_id', 'field_name', 'field_label', 'field_type', 'status')
    search_fields = ('field_name', 'field_label')
    list_filter = ('field_type', 'status')
