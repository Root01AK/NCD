from rest_framework import serializers
from .models import CmsUsers, CmsUserrole, CmsMenuprivileges

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='usr_id', read_only=True)
    username = serializers.CharField(source='users_name', read_only=True)
    role_id = serializers.IntegerField(source='user_role', read_only=True)
    role_name = serializers.CharField(read_only=True)
    location = serializers.CharField(source='loc_code', read_only=True)
    role = serializers.CharField(source='state_code', read_only=True)

    class Meta:
        model = CmsUsers
        fields = [
            'id', 'usr_id', 'username', 'users_name', 'full_name',
            'email', 'status', 'loc_code', 'location', 'state_code',
            'role', 'signedin_loc', 'user_role', 'role_id', 'role_name',
            'create_time', 'update_time'
        ]


class UserCreateUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    users_name = serializers.CharField(required=False)
    password = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, default='')
    email = serializers.CharField(required=False, allow_blank=True, default='')
    location = serializers.CharField(required=False, default='Dharavi')
    loc_code = serializers.CharField(required=False, default='DH')
    role = serializers.CharField(required=False, default='field_supervisor')
    user_role = serializers.IntegerField(required=False, default=2)
    state_code = serializers.CharField(required=False, default='field_supervisor')
    signedin_loc = serializers.CharField(required=False, default='Dharavi Center')
    status = serializers.CharField(required=False, default='1')
    privileges = serializers.ListField(child=serializers.IntegerField(), required=False)
