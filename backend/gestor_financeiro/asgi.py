"""
ASGI config for gestor_financeiro project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestor_financeiro.settings.development')

application = get_asgi_application()

