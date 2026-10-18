export function generarEnlaceWhatsApp(telefono, nombreProfesional) {
    // Limpiar el número de caracteres no numéricos
    const numeroLimpio = (telefono || '51999999999').replace(/\D/g, '');
    
    // Asegurar código de país de Perú (51)
    const codigoPais = numeroLimpio.startsWith('51') ? numeroLimpio : `51${numeroLimpio}`;
    
    const mensaje = `Hola ${nombreProfesional}, encontré tu perfil en T-CUIDO y quisiera conocer más sobre tus servicios, disponibilidad y tarifas.`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    return `https://wa.me/${codigoPais}?text=${mensajeCodificado}`;
}