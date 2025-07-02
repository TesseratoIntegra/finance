"""
WSGI config for gestor_financeiro project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestor_financeiro.settings.development')

application = get_wsgi_application()

