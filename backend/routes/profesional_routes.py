from flask import Blueprint, jsonify, request
from services.supabase_client import get_supabase

profesional_bp = Blueprint('profesional_bp', __name__)

@profesional_bp.route('/profesionales', methods=['GET'])
def get_profesionales():
    try:
        supabase = get_supabase()
        
        tipo = request.args.get('tipo')
        
        # Hacemos una consulta limpia a la tabla de perfiles profesionales
        query = supabase.table('perfiles_profesionales').select('*')
        
        if tipo:
            query = query.eq('tipo_profesional', tipo)
            
        response = query.eq('estado_publicacion', True).execute()
        return jsonify(response.data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@profesional_bp.route('/profesionales/<int:prof_id>', methods=['GET'])
def get_profesional_detalle(prof_id):
    try:
        supabase = get_supabase()
        response = supabase.table('perfiles_profesionales').select('*, perfiles_usuario(nombres, apellidos, telefono), zonas_atencion(*, distritos(*))').eq('id', prof_id).single().execute()
        
        if not response.data:
            return jsonify({"error": "Profesional no encontrado"}), 404
            
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500