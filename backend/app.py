import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from services.supabase_client import supabase

# Definir la ruta absoluta basada en la ubicación de este archivo (backend/app.py)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '../frontend'))

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Helper para verificar token y rol (lo mantenemos intacto)
def obtener_usuario_autenticado(req):
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        res_user = supabase.auth.get_user(token)
        if not res_user or not res_user.user:
            return None
        
        user_id = res_user.user.id
        res_perfil = supabase.table('perfiles_usuario').select('tipo_usuario, nombres, apellidos').eq('id', user_id).single().execute()
        perfil = res_perfil.data if res_perfil.data else {}
        
        return {
            "id": user_id,
            "email": res_user.user.email,
            "tipo_usuario": perfil.get('tipo_usuario', 'cliente'),
            "nombres": perfil.get('nombres'),
            "apellidos": perfil.get('apellidos')
        }
    except Exception as e:
        print("Error al verificar token:", e)
        return None

# API ENDPOINTS AUTENTICACIÓN
@app.route('/api/auth/registro', methods=['POST'])
def registrar_usuario():
    datos = request.get_json() or {}
    email = datos.get('email')
    password = datos.get('password')
    nombres = datos.get('nombres')
    apellidos = datos.get('apellidos')
    tipo_usuario = datos.get('tipo_usuario', 'cliente')

    if not email or not password or not nombres or not apellidos:
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    try:
        res_auth = supabase.auth.sign_up({"email": email, "password": password})
        
        # IMPRIMIMOS ESTO EN LA TERMINAL PARA INVESTIGAR
        print("RESPUESTA AUTH SUPABASE:", res_auth)

        if not res_auth or not res_auth.user:
            return jsonify({"error": "No se pudo crear el usuario en Auth"}), 400

        user_id = res_auth.user.id

        # Insertar en perfiles_usuario
        perfil_data = {
            "id": user_id,
            "nombres": nombres,
            "apellidos": apellidos,
            "tipo_usuario": tipo_usuario
        }
        
        res_insert = supabase.table('perfiles_usuario').insert(perfil_data).execute()
        print("RESPUESTA INSERT PERFIL:", res_insert)

        if tipo_usuario == 'profesional':
            supabase.table('profesionales').insert({
                "id": user_id, "tipo_profesional": "cuidador_adulto_mayor", "estado_publicacion": False
            }).execute()

        return jsonify({"mensaje": "Usuario registrado exitosamente"}), 201

    except Exception as e:
        # IMPRIMIMOS EL ERROR EXACTO EN LA TERMINAL
        print("EXCEPCIÓN REAL EN REGISTRO:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_usuario():
    datos = request.get_json() or {}
    try:
        res_auth = supabase.auth.sign_in_with_password({"email": datos.get('email'), "password": datos.get('password')})
        if not res_auth.session:
            return jsonify({"error": "Credenciales inválidas"}), 401

        token = res_auth.session.access_token
        user_id = res_auth.user.id
        res_perfil = supabase.table('perfiles_usuario').select('tipo_usuario, nombres, apellidos').eq('id', user_id).single().execute()
        perfil = res_perfil.data or {}

        return jsonify({
            "token": token,
            "usuario": {
                "id": user_id, "email": datos.get('email'),
                "nombres": perfil.get('nombres'), "apellidos": perfil.get('apellidos'),
                "tipo_usuario": perfil.get('tipo_usuario', 'cliente')
            }
        }), 200
    except Exception as e:
        return jsonify({"error": "Credenciales incorrectas o usuario no verificado"}), 401

@app.route('/api/auth/recuperar', methods=['POST'])
def recuperar_password():
    datos = request.get_json() or {}
    try:
        supabase.auth.reset_password_email(datos.get('email'))
        return jsonify({"mensaje": "Instrucciones enviadas al correo."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/perfil', methods=['GET'])
def obtener_perfil_actual():
    usuario = obtener_usuario_autenticado(request)
    if not usuario:
        return jsonify({"error": "No autorizado"}), 401
    return jsonify(usuario), 200

# RUTAS ADMINISTRATIVAS PROTEGIDAS
@app.route('/api/admin/solicitudes', methods=['GET'])
def listar_solicitudes_pendientes():
    usuario = obtener_usuario_autenticado(request)
    if not usuario or usuario.get('tipo_usuario') != 'administrador':
        return jsonify({"error": "Acceso denegado."}), 403
    res = supabase.table('profesionales').select('*, perfiles_usuario(*)').eq('estado_publicacion', False).execute()
    return jsonify(res.data), 200

@app.route('/api/admin/aprobar/<id_profesional>', methods=['POST'])
def aprobar_profesional(id_profesional):
    usuario = obtener_usuario_autenticado(request)
    if not usuario or usuario.get('tipo_usuario') != 'administrador':
        return jsonify({"error": "Acceso denegado."}), 403
    supabase.table('profesionales').update({'estado_publicacion': True}).eq('id', id_profesional).execute()
    return jsonify({"mensaje": "Perfil aprobado"}), 200

# RUTAS PARA SERVIR EL FRONTEND DE FORMA SEGURA
@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/pages/<path:nombre_pagina>')
def serve_pages(nombre_pagina):
    return send_from_directory(os.path.join(FRONTEND_DIR, 'pages'), nombre_pagina)

@app.route('/<path:path>')
def serve_static_files(path):
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, '404.html'), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)