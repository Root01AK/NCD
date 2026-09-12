import hashlib
from django.contrib.auth.hashers import BasePasswordHasher

class LegacyMD5PasswordHasher(BasePasswordHasher):
    """
    Custom password hasher to verify legacy MD5, double-MD5, and plain-text passwords
    stored in MySQL cms_users table.
    """
    algorithm = "legacy_md5"

    def encode(self, password, salt=''):
        # For new encoded passwords, use MD5 hash format
        return hashlib.md5(password.encode('utf-8')).hexdigest()

    def verify(self, password, encoded):
        if not encoded or not password:
            return False
        
        trim_pass = password.strip()
        md5_hash = hashlib.md5(trim_pass.encode('utf-8')).hexdigest()
        double_md5 = hashlib.md5(md5_hash.encode('utf-8')).hexdigest()

        # Check against direct MD5, double MD5, or plain-text fallback
        if encoded == md5_hash or encoded == double_md5 or encoded == trim_pass:
            return True
            
        return False

    def safe_summary(self, encoded):
        return {
            'algorithm': self.algorithm,
            'hash': encoded[:6] + '...' if len(encoded) > 6 else encoded,
        }
