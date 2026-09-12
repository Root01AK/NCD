from django.db import models

class CmsUsers(models.Model):
    usr_id = models.AutoField(primary_key=True)
    users_name = models.CharField(max_length=64, unique=True)
    password = models.TextField()
    auth_key = models.CharField(max_length=64, default='')
    password_reset_token = models.CharField(max_length=255, null=True, blank=True)
    full_name = models.CharField(max_length=50, default='')
    email = models.CharField(max_length=320, null=True, blank=True)
    status = models.CharField(max_length=1, default='1')
    create_time = models.IntegerField(null=True, blank=True)
    create_user = models.IntegerField(null=True, blank=True)
    update_time = models.IntegerField(null=True, blank=True)
    update_user = models.IntegerField(null=True, blank=True)
    user_type = models.IntegerField(null=True, blank=True)
    record_date = models.IntegerField(null=True, blank=True)
    loc_code = models.TextField(null=True, blank=True)
    signedin_loc = models.CharField(max_length=50, null=True, blank=True)
    state_code = models.CharField(max_length=50, null=True, blank=True)
    user_role = models.SmallIntegerField(default=1)

    class Meta:
        db_table = 'cms_users'
        managed = False
        verbose_name = 'User Account'
        verbose_name_plural = 'User Accounts'

    def __str__(self):
        return f"{self.users_name} ({self.full_name})"

    @property
    def role_name(self):
        roles_map = {
            1: 'Admin',
            2: 'Field Supervisor',
            3: 'Staff Nurse',
            4: 'Doctor',
            5: 'Counselor',
            6: 'Case Management Coordinator',
            7: 'Data Entry Operator'
        }
        return roles_map.get(self.user_role, 'Staff')


class CmsUserrole(models.Model):
    id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=100)
    role_desc = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=1, default='1')

    class Meta:
        db_table = 'cms_userrole'
        managed = False
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'


class CmsMenuprivileges(models.Model):
    id = models.AutoField(primary_key=True)
    role_id = models.IntegerField()
    menu_id = models.IntegerField()
    status = models.CharField(max_length=1, default='1')

    class Meta:
        db_table = 'cms_menuprivileges'
        managed = False
        verbose_name = 'Menu Privilege'
        verbose_name_plural = 'Menu Privileges'
