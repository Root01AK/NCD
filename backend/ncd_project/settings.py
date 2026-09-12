import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(BASE_DIR / '.env')

# Quick-start development settings - unsuitable for production
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-ncd-yrgcare-platform-secret-key-2026')

DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() in ('true', '1', 't')

# Allowed Hosts (Production Domains & Wildcards)
allowed_hosts_env = os.getenv('ALLOWED_HOSTS', '*')
if allowed_hosts_env.strip() == '*':
    ALLOWED_HOSTS = ['*']
else:
    custom_hosts = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()]
    DEFAULT_HOSTS = [
        'ncd.yrgmerf.in',
        'ncdadmin.yrgmerf.in',
        'ncdapi.yrgmerf.in',
        'ncdbsql.yrgmerf.in',
        'localhost',
        '127.0.0.1',
        '0.0.0.0'
    ]
    ALLOWED_HOSTS = list(set(DEFAULT_HOSTS + custom_hosts))

# Application definition
INSTALLED_APPS = [
    # Unfold Premium Admin Theme (Must precede django.contrib.admin)
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'corsheaders',
    'rest_framework',
    'drf_spectacular',

    # NCD Domain Apps
    'apps.core.apps.CoreConfig',
    'apps.authentication.apps.AuthenticationConfig',
    'apps.surveys.apps.SurveysConfig',
    'apps.screening.apps.ScreeningConfig',
    'apps.clinical.apps.ClinicalConfig',
    'apps.locations.apps.LocationsConfig',
    'apps.dashboard.apps.DashboardConfig',
    'apps.database_mastery.apps.DatabaseMasteryConfig',
    'apps.reports.apps.ReportsConfig',
]

# Unfold Premium Admin Configuration
UNFOLD = {
    "SITE_TITLE": "NCD Enterprise Master Control",
    "SITE_HEADER": "Super Portal — NCD Platform",
    "SITE_SUBHEADER": "Non-Communicable Disease Clinical Surveillance & Screening Management",
    "SITE_SYMBOL": "speedometer",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "COLORS": {
        "primary": {
            "50": "254 252 232",
            "100": "254 249 195",
            "200": "254 240 139",
            "300": "253 224 71",
            "400": "250 204 21",
            "500": "245 212 11", # Brand Gold #f5d40b
            "600": "202 138 4",
            "700": "161 98 7",
            "800": "133 77 14",
            "900": "113 63 18",
            "950": "66 32 6",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": "Super Admin Privileges",
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": "/",
                    },
                    {
                        "title": "Survey Management",
                        "icon": "poll",
                        "link": "/surveys/cmssurveymaster/",
                    },
                    {
                        "title": "Participants",
                        "icon": "groups",
                        "link": "/screening/cmsscreening/",
                    },
                    {
                        "title": "Location Master",
                        "icon": "location_on",
                        "link": "/locations/cmslocationmaster/",
                    },
                    {
                        "title": "Data Export",
                        "icon": "download",
                        "link": "/api/v1/database/export-csv",
                    },
                    {
                        "title": "User Management",
                        "icon": "manage_accounts",
                        "link": "/authentication/cmsusers/",
                    },
                    {
                        "title": "My Profile",
                        "icon": "account_circle",
                        "link": "/password_change/",
                    },
                ],
            },
            {
                "title": "System Settings & Roles",
                "items": [
                    {
                        "title": "User Roles",
                        "icon": "badge",
                        "link": "/authentication/cmsuserrole/",
                    },
                    {
                        "title": "Menu Privileges",
                        "icon": "lock_person",
                        "link": "/authentication/cmsmenuprivileges/",
                    },
                    {
                        "title": "Survey Fields Master",
                        "icon": "tune",
                        "link": "/surveys/cmsfieldmaster/",
                    },
                    {
                        "title": "State Master",
                        "icon": "map",
                        "link": "/locations/cmsstatemaster/",
                    },
                ],
            },
        ],
    },
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ncd_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ncd_project.wsgi.application'
ASGI_APPLICATION = 'ncd_project.asgi.application'

# Database Configuration (MySQL)
DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('DB_URL') or os.getenv('MYSQL_URL')
if DATABASE_URL:
    from urllib.parse import urlparse, unquote
    parsed_db = urlparse(DATABASE_URL)
    DB_HOST = parsed_db.hostname or '127.0.0.1'
    DB_PORT = str(parsed_db.port or 3306)
    DB_NAME = parsed_db.path.lstrip('/') or 'ncd'
    DB_USER = unquote(parsed_db.username) if parsed_db.username else 'root'
    DB_PASSWORD = unquote(parsed_db.password) if parsed_db.password else ''
else:
    DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME', os.getenv('MYSQL_DATABASE', 'ncd'))
    DB_USER = os.getenv('DB_USER', os.getenv('MYSQL_USER', 'root'))
    DB_PASSWORD = os.getenv('DB_PASSWORD', os.getenv('MYSQL_PASSWORD', 'Kirub@2001'))

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
        'CONN_MAX_AGE': int(os.getenv('DB_CONN_MAX_AGE', '300')),
        'CONN_HEALTH_CHECKS': True,
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode=''",
        },
    }
}

# High-Performance In-Memory Cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'ncd-capacity-cache',
        'TIMEOUT': 300,
        'OPTIONS': {
            'MAX_ENTRIES': 50000,
        }
    }
}

# Custom Password Hashers (Supporting Legacy MD5 + PBKDF2)
PASSWORD_HASHERS = [
    'apps.authentication.hashers.LegacyMD5PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# Authentication Backends
AUTHENTICATION_BACKENDS = [
    'apps.authentication.backends.StaffAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
    'UNAUTHENTICATED_USER': None,
}

# Swagger / OpenAPI Documentation Settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'NCD Clinical & Community Survey Platform API',
    'DESCRIPTION': 'Enterprise Django REST API powering Non-Communicable Diseases (NCD) Screening, Clinical Linkage & 3-Attempt Longitudinal Tracking.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

# CORS Configuration
from corsheaders.defaults import default_headers

CORS_ALLOW_CREDENTIALS = True

# Allowed CORS Headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'cache-control',
    'pragma',
    'expires',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Production Allowed Origins
DEFAULT_CORS_ORIGINS = [
    "https://ncd.yrgmerf.in",
    "https://ncdadmin.yrgmerf.in",
    "https://ncdapi.yrgmerf.in",
    "https://ncdbsql.yrgmerf.in",
]

cors_origins_env = os.getenv('CORS_ALLOWED_ORIGINS', '')
if cors_origins_env:
    custom_cors = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]
    CORS_ALLOWED_ORIGINS = list(set(DEFAULT_CORS_ORIGINS + custom_cors))
else:
    CORS_ALLOWED_ORIGINS = DEFAULT_CORS_ORIGINS

# In local development mode, allow localhost origins and allow all origins
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_ORIGINS = list(set(CORS_ALLOWED_ORIGINS + [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:8001",
        "http://127.0.0.1:8080",
    ]))
else:
    CORS_ALLOW_ALL_ORIGINS = False


# CSRF Trusted Origins (Essential for Coolify Production Domains & Admin Portal)
DEFAULT_TRUSTED_ORIGINS = [
    'https://ncd.yrgmerf.in',
    'https://ncdadmin.yrgmerf.in',
    'https://ncdapi.yrgmerf.in',
    'https://ncdbsql.yrgmerf.in',
    'http://ncd.yrgmerf.in',
    'http://ncdadmin.yrgmerf.in',
    'http://ncdapi.yrgmerf.in',
    'http://ncdbsql.yrgmerf.in',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8001'
]

csrf_origins_env = os.getenv('CSRF_TRUSTED_ORIGINS', '')
if csrf_origins_env:
    custom_origins = [origin.strip() for origin in csrf_origins_env.split(',') if origin.strip()]
    CSRF_TRUSTED_ORIGINS = list(set(DEFAULT_TRUSTED_ORIGINS + custom_origins))
else:
    CSRF_TRUSTED_ORIGINS = DEFAULT_TRUSTED_ORIGINS

# Reverse Proxy SSL Header (Critical for Coolify / Traefik / Nginx HTTPS termination)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Production Cookie Security (Disabled in DEBUG for local testing)
if not DEBUG:
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
else:
    CSRF_COOKIE_SECURE = False
    SESSION_COOKIE_SECURE = False

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
WHITENOISE_MANIFEST_STRICT = False

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


