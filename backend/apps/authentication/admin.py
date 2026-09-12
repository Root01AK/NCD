from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CmsUsers, CmsUserrole, CmsMenuprivileges

@admin.register(CmsUsers)
class CmsUsersAdmin(ModelAdmin):
    list_display = ('usr_id', 'users_name', 'full_name', 'email', 'role_name', 'status', 'signedin_loc')
    search_fields = ('users_name', 'full_name', 'email', 'loc_code')
    list_filter = ('status', 'user_role', 'signedin_loc')
    ordering = ('usr_id',)

@admin.register(CmsUserrole)
class CmsUserroleAdmin(ModelAdmin):
    list_display = ('id', 'role_name', 'role_desc', 'status')
    search_fields = ('role_name',)
    list_filter = ('status',)

@admin.register(CmsMenuprivileges)
class CmsMenuprivilegesAdmin(ModelAdmin):
    list_display = ('id', 'role_id', 'menu_id', 'status')
    list_filter = ('role_id', 'status')
