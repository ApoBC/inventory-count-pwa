# 🔐 Política de Seguridad

## Reportar Vulnerabilidades

**NO reportes vulnerabilidades en issues públicos.** En su lugar, envía un email a:

📧 **billcastillo99@gmail.com**

Por favor incluye:
- Descripción de la vulnerabilidad
- Pasos para reproducir
- Impacto potencial
- Versión afectada
- Sugerencia de parche (opcional)

---

## Prácticas de Seguridad del Proyecto

### Autenticación
- ✅ JWT con refresh tokens (24h access, 7d refresh)
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Tokens refrescados automáticamente

### Validación
- ✅ Zod schema validation en todos los inputs
- ✅ Rate limiting (100 req/min)
- ✅ Input sanitization

### Base de Datos
- ✅ Prepared statements (Prisma ORM)
- ✅ ACID transactions
- ✅ UNIQUE constraints para idempotency

### Transporte
- ✅ HTTPS recomendado en producción
- ✅ CORS configurado
- ✅ Security headers (Helmet)

### Secretos
- ✅ Nunca hardcodea API keys o passwords
- ✅ Usa variables de entorno
- ✅ .gitignore excluye .env

---

## Responsabilidades de Usuarios

Si despliegas este proyecto:

1. **Cambiar secretos por defecto**
   ```bash
   JWT_SECRET=tu-secreto-seguro
   DB_PASSWORD=tu-contraseña-fuerte
   ```

2. **Usar HTTPS en producción**
   - Obtener certificado SSL/TLS
   - Configurar Nginx o similar

3. **Mantener dependencias actualizadas**
   ```bash
   npm audit
   npm update
   ```

4. **Monitorear seguridad**
   - Logs de acceso
   - Alerts de errores
   - Sentry o similar

5. **Backup de datos**
   - BD backup diario
   - Disaster recovery plan

---

## Versiones Soportadas

| Versión | Soporte | Estado |
|---------|---------|--------|
| 1.0.x   | ✅ Activo | Actual |
| < 1.0   | ❌ No soportado | Deprecated |

---

## Dependencias

Verificamos regularmente:
- `npm audit` para vulnerabilidades
- Dependabot para actualizaciones
- GitHub Security Advisories

Si encuentras una vulnerabilidad en una dependencia:
1. Reporta directamente al proyecto de la dependencia
2. Notificanos también para documentar

---

## Proceso de Respuesta a Vulnerabilidades

1. **Confirmación** (24-48h)
   - Verificamos la vulnerabilidad
   - Evaluamos el impacto

2. **Desarrollo de Parche** (variable)
   - Creamos fix
   - Testing extenso
   - Verificamos sin regresiones

3. **Disclosure** (coordenado)
   - Publicamos parche
   - Release notes con detalles
   - Notificamos a usuarios

4. **Post-Mortem**
   - Analizamos raíz del problema
   - Mejoramos prácticas

---

## Best Practices para Contribuidores

### Código
- No uses `eval()` o `dangerouslySetInnerHTML`
- Evita inyección SQL (siempre usa prepared statements)
- Valida TODOS los inputs
- No almacenes passwords en plain text

### Dependencias
- Elige librerías bien mantenidas
- Verifica npm security score
- Minimiza dependencias

### Secrets
- Nunca commites .env
- Usa environment variables
- Rota secretos regularmente

### Testing
- Test de seguridad específicos
- Tests de autenticación
- Tests de autorización

---

## Recursos de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security](https://docs.npmjs.com/cli/v9/using-npm/security)

---

## Contacto

- **Seguridad:** billcastillo99@gmail.com
- **Bugs:** GitHub Issues
- **Preguntas:** GitHub Discussions

---

**Última actualización:** 2026-10-02
