from flask import Blueprint, jsonify
from services.supabase_client import get_supabase

geo_bp = Blueprint('geo_bp', __name__)

@geo_bp.route('/departamentos', methods=['GET'])
def get_departamentos():
    try:
        supabase = get_supabase()
        response = supabase.table('departamentos').select('*').order('nombre').execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@geo_bp.route('/provincias/<int:dep_id>', methods=['GET'])
def get_provincias(dep_id):
    try:
        supabase = get_supabase()
        response = supabase.table('provincias').select('*').eq('departamento_id', dep_id).order('nombre').execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@geo_bp.route('/distritos/<int:prov_id>', methods=['GET'])
def get_distritos(prov_id):
    try:
        supabase = get_supabase()
        response = supabase.table('distritos').select('*').eq('provincia_id', prov_id).order('nombre').execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500