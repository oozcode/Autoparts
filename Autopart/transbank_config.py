import os
from dotenv import load_dotenv

# Carga el archivo .env que debe estar en la raíz del proyecto
load_dotenv()

TBK_API_KEY = os.getenv('TRANSBANK_API_KEY')
TBK_MALL_ID = os.getenv('TRANSBANK_MALL_ID')
TBK_COMMERCE_CODE = os.getenv('TRANSBANK_COMMERCE_CODE')
TBK_INTEGRATION_TYPE = os.getenv('TRANSBANK_ENV', 'TEST')