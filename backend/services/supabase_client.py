from supabase import create_client, Client
from config import Config

# Creamos la instancia directamente para que app.py la importe sin problemas
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

def get_supabase() -> Client:
    return supabase