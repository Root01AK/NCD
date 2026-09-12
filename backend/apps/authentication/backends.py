import hashlib
import time
from .models import CmsUsers

class StaffAuthBackend:
    """
    Authenticate against legacy cms_users table with support for
    quick role shortcuts and MD5/Plaintext password hashes.
    """
    QUICK_ROLES = {
        'admin_user':  {'pass': 'admin123', 'id': 1, 'username': 'admin_user', 'role_id': 1, 'role_name': 'Admin'},
        'react_admin': {'pass': 'admin123', 'id': 1, 'username': 'admin_user', 'role_id': 1, 'role_name': 'Admin'},
        'admin':       {'pass': 'admin123', 'id': 1, 'username': 'admin_user', 'role_id': 1, 'role_name': 'Admin'},
        'deo':         {'pass': 'deo', 'id': 2, 'username': 'FS001', 'role_id': 2, 'role_name': 'Field Supervisor'},
        'fs001':       {'pass': 'fsadmin123', 'id': 2, 'username': 'FS001', 'role_id': 2, 'role_name': 'Field Supervisor'},
        'nurse':       {'pass': 'nurse', 'id': 3, 'username': 'SN001', 'role_id': 3, 'role_name': 'Staff Nurse'},
        'sn001':       {'pass': 'snadmin123', 'id': 3, 'username': 'SN001', 'role_id': 3, 'role_name': 'Staff Nurse'},
        'doctor':      {'pass': 'doctor', 'id': 4, 'username': 'D001', 'role_id': 4, 'role_name': 'Doctor'},
        'd001':        {'pass': 'dadmin123', 'id': 4, 'username': 'D001', 'role_id': 4, 'role_name': 'Doctor'},
        'counselor':   {'pass': 'counselor', 'id': 5, 'username': 'C001', 'role_id': 5, 'role_name': 'Counselor'},
        'c001':        {'pass': 'cadmin123', 'id': 5, 'username': 'C001', 'role_id': 5, 'role_name': 'Counselor'},
        'coordinator': {'pass': 'coordinator', 'id': 6, 'username': 'CMC001', 'role_id': 6, 'role_name': 'Case Management Coordinator'},
        'cmc001':      {'pass': 'cmcadmin123', 'id': 6, 'username': 'CMC001', 'role_id': 6, 'role_name': 'Case Management Coordinator'},
    }

    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        clean_user = username.strip().lower()
        clean_pass = password.strip().lower()

        # 1. Quick roles shortcut check
        if clean_user in self.QUICK_ROLES and self.QUICK_ROLES[clean_user]['pass'].lower() == clean_pass:
            role_info = self.QUICK_ROLES[clean_user]
            try:
                user_obj = CmsUsers.objects.filter(users_name__iexact=role_info['username']).first()
                if user_obj:
                    return user_obj
            except Exception:
                pass

        # 2. Database lookup in cms_users
        try:
            user = CmsUsers.objects.filter(users_name__iexact=username.strip()).first()
            if user:
                stored = (user.password or '').strip()
                trim_pass = password.strip()
                md5 = hashlib.md5(trim_pass.encode('utf-8')).hexdigest()
                double_md5 = hashlib.md5(md5.encode('utf-8')).hexdigest()

                if stored == trim_pass or stored == md5 or stored == double_md5 or stored.lower() == trim_pass.lower():
                    return user
        except Exception:
            pass

        return None

    def get_user(self, user_id):
        try:
            return CmsUsers.objects.get(pk=user_id)
        except CmsUsers.DoesNotExist:
            return None
