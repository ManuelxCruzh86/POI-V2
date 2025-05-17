const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db"); 
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const SECRET_KEY = "tu_clave_secreta"; 
const SALT_ROUNDS = 10;

//Funciones para subir fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../Imagenes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});




//Endpoints Usuarios
router.post("/register", async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        db.query(
            "SELECT email FROM Usuarios WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                
                if (results.length > 0) {
                    return res.status(400).json({ error: "El email ya está registrado" });
                }
                

                const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);


                db.query(
                    "INSERT INTO Usuarios (nombre, email, password_hash, conectado) VALUES (?, ?, ?, ?)",
                    [nombre, email, hashedPassword, true],
                    (err, result) => {
                        if (err) return res.status(500).json({ 
                            success: false,
                            message: "Error al crear el usuario",
                            error: err.message  
                        });
                        
                        const userId = result.insertId;

                        const tokenPayload = {
                            id: userId,
                            nombre,
                            email,
                            esta_activo: true
                        };

                        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "1h" });

                        const userData = {
                            id: userId,
                            nombre,
                            email,
                            esta_activo: true,
                            foto_perfil: "/anonimo.png"
                        };

                        res.status(201).json({
                            success: true,
                            message: "Registro exitoso. Bienvenido!",
                            token,
                            user: userData
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Error en el proceso de registro:", error);
        res.status(500).json({ 
            success: false,
            message: "Error en el servidor",
            error: error.message 
        });
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: "Email y contraseña son requeridos" 
        });
    }

    try {
        db.query(
            "SELECT id, nombre, email, password_hash, conectado, avatar_url FROM Usuarios WHERE email = ?", 
            [email], 
            async (err, results) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false,
                        message: "Error en el servidor",
                        error: err.message 
                    });
                }

                if (results.length === 0) {
                    return res.status(401).json({ 
                        success: false,
                        message: "Credenciales inválidas" 
                    });
                }

                const user = results[0];

                const isPasswordValid = await bcrypt.compare(password, user.password_hash);
                
                if (!isPasswordValid) {
                    return res.status(401).json({ 
                        success: false,
                        message: "Credenciales inválidas" 
                    });
                }

                // ✅ Marcar usuario como conectado
                db.query(
                    "UPDATE Usuarios SET conectado = TRUE WHERE id = ?",
                    [user.id],
                    (updateErr) => {
                        if (updateErr) {
                            console.error("Error al actualizar el estado de conexión:", updateErr);
                            return res.status(500).json({
                                success: false,
                                message: "Error al marcar como conectado",
                                error: updateErr.message
                            });
                        }

                        const tokenPayload = {
                            id: user.id,
                            nombre: user.nombre,
                            email: user.email,
                            esta_activo: true
                        };

                        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "1h" });

                        const userData = {
                            id: user.id,
                            nombre: user.nombre,
                            email: user.email,
                            esta_activo: true,
                            foto_perfil: user.avatar_url || "/anonimo.png"
                        };

                        res.json({
                            success: true,
                            message: "Inicio de sesión exitoso",
                            token,
                            user: userData
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Error en el proceso de login:", error);
        res.status(500).json({ 
            success: false,
            message: "Error en el servidor",
            error: error.message 
        });
    }
});
router.get("/usuarios", (req, res) => {
    db.query("SELECT id, nombre FROM Usuarios", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
router.get('/api/usuarios', (req, res) => {
    db.query('SELECT id, nombre, email, conectado FROM Usuarios', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
});
router.get("/perfil", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Token no proporcionado" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token inválido" });
        res.json(decoded);
    });
});
router.get('/datosUser/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ error: "ID de usuario inválido" });
    }

    db.query(
        'SELECT id, nombre, email, avatar_url, conectado FROM Usuarios WHERE id = ?',
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(results[0]); 
        }
    );
});
router.put('/actualizarUsuario/:userId', upload.single('avatar'), (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "ID de usuario inválido" });
  }

  const { nombre, email, password } = req.body;
  let avatarUrl = null;

  // Paso 1: Manejar la imagen si fue subida
  if (req.file) {
    avatarUrl = `/Imagenes/${req.file.filename}`;
    
    // Primero obtener el usuario actual para ver si tiene imagen anterior
    db.query('SELECT avatar_url FROM Usuarios WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const user = results[0];
      
      // Eliminar imagen anterior si existe y no es la default
      if (user.avatar_url && !user.avatar_url.includes('default-avatar')) {
        const oldImagePath = path.join(__dirname, '..', user.avatar_url);
        fs.unlink(oldImagePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error eliminando imagen anterior:", unlinkErr);
        });
      }

      // Continuar con la actualización
      actualizarUsuario();
    });
  } else {
    // Si no hay imagen, continuar directamente
    actualizarUsuario();
  }

  function actualizarUsuario() {
    // Paso 2: Construir la consulta de actualización
    let query = 'UPDATE Usuarios SET ';
    const params = [];
    const updates = [];

    if (nombre) {
      updates.push('nombre = ?');
      params.push(nombre);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (password) {
      // Paso 3: Hashear la contraseña primero
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error(hashErr);
          return res.status(500).json({ error: "Error al hashear la contraseña" });
        }

        updates.push('password_hash = ?');
        params.push(hashedPassword);
        
        completarActualizacion();
      });
    } else {
      completarActualizacion();
    }

    function completarActualizacion() {
      if (avatarUrl) {
        updates.push('avatar_url = ?');
        params.push(avatarUrl);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No hay datos para actualizar" });
      }

      query += updates.join(', ') + ' WHERE id = ?';
      params.push(userId);

      // Paso 4: Ejecutar la actualización
      db.query(query, params, (updateErr, updateResults) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ error: updateErr.message });
        }

        // Paso 5: Obtener el usuario actualizado
        db.query(
          'SELECT id, nombre, email, avatar_url, conectado FROM Usuarios WHERE id = ?',
          [userId],
          (selectErr, selectResults) => {
            if (selectErr) {
              console.error(selectErr);
              return res.status(500).json({ error: selectErr.message });
            }

            if (selectResults.length === 0) {
              return res.status(404).json({ error: "Usuario no encontrado después de actualizar" });
            }

            res.json(selectResults[0]);
          }
        );
      });
    }
  }
});
router.get("/grupos/:grupoId/miembros", (req, res) => {
    const grupoId = parseInt(req.params.grupoId);

    if (isNaN(grupoId)) {
        return res.status(400).json({
            success: false,
            message: "ID de grupo inválido"
        });
    }

    const query = `
        SELECT u.*
        FROM MiembrosGrupo mg
        JOIN Usuarios u ON mg.usuario_id = u.id
        WHERE mg.grupo_id = ?
    `;

    db.query(query, [grupoId], (err, results) => {
        if (err) {
            console.error("Error al obtener los miembros:", err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener los miembros del grupo",
                error: err.message
            });
        }

        res.json({
            success: true,
            miembros: results
        });
    });
});
router.put("/usuarios/:id/desconectar", (req, res) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: "ID de usuario inválido"
        });
    }

    const query = `
        UPDATE Usuarios
        SET conectado = FALSE
        WHERE id = ?
    `;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error al actualizar estado de conexión:", err);
            return res.status(500).json({
                success: false,
                message: "Error al actualizar estado del usuario",
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Usuario marcado como desconectado"
        });
    });
});





//Endpoints Grupos
router.post("/create/group", (req, res) => {
    const { nombre, descripcion, creador_id, miembros = [] } = req.body;


    if (!nombre || !creador_id) {
        return res.status(400).json({ 
            success: false,
            message: "Nombre del grupo y ID del creador son requeridos" 
        });
    }


    const miembrosUnicos = [...new Set([...miembros, creador_id])];

    db.query(
        "INSERT INTO Grupos (nombre, descripcion, creador_id) VALUES (?, ?, ?)",
        [nombre, descripcion, creador_id],
        (err, grupoResult) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        success: false,
                        message: "Ya tienes un grupo con este nombre y descripción"
                    });
                }

                console.error("Error al crear grupo:", err);
                return res.status(500).json({ 
                    success: false,
                    message: "Error al crear el grupo",
                    error: err.message 
                });
            }

            const grupoId = grupoResult.insertId;


            verificarYAgregarMiembros(grupoId, miembrosUnicos, res);
        }
    );
});
function verificarYAgregarMiembros(grupoId, miembros, res) {

    db.query(
        "SELECT usuario_id FROM MiembrosGrupo WHERE grupo_id = ?",
        [grupoId],
        (err, resultados) => {
            if (err) {
                console.error("Error al verificar miembros:", err);
                return res.status(500).json({ 
                    success: false,
                    message: "Error al verificar miembros existentes",
                    error: err.message 
                });
            }

   
            const miembrosExistentes = resultados.map(r => r.usuario_id);
            
        
            const nuevosMiembros = miembros.filter(
                id => !miembrosExistentes.includes(id)
            );

        
            if (nuevosMiembros.length === 0) {
                return obtenerDatosGrupo(grupoId, res);
            }


            const valoresMiembros = nuevosMiembros.map(usuario_id => [grupoId, usuario_id]);
            
            db.query(
                "INSERT INTO MiembrosGrupo (grupo_id, usuario_id) VALUES ?",
                [valoresMiembros],
                (err) => {
                    if (err) {
                        console.error("Error al agregar miembros:", err);
                        return res.status(500).json({ 
                            success: false,
                            message: "Grupo creado pero falló al agregar nuevos miembros",
                            error: err.message 
                        });
                    }

                    obtenerDatosGrupo(grupoId, res);
                }
            );
        }
    );
}
function obtenerDatosGrupo(grupoId, res) {

    db.query(
        "SELECT g.id, g.nombre, g.descripcion, g.created_at, " +
        "u.id as creador_id, u.nombre as creador_nombre, u.avatar_url as creador_avatar " +
        "FROM Grupos g " +
        "JOIN Usuarios u ON g.creador_id = u.id " +
        "WHERE g.id = ?",
        [grupoId],
        (err, grupoCreado) => {
            if (err) {
                console.error("Error al obtener grupo:", err);
                return res.status(500).json({ 
                    success: false,
                    message: "Grupo creado pero falló al obtener detalles",
                    error: err.message 
                });
            }


            db.query(
                "SELECT u.id, u.nombre, u.email, u.avatar_url " +
                "FROM MiembrosGrupo mg " +
                "JOIN Usuarios u ON mg.usuario_id = u.id " +
                "WHERE mg.grupo_id = ?",
                [grupoId],
                (err, miembrosGrupo) => {
                    if (err) {
                        console.error("Error al obtener miembros:", err);
                        return res.status(500).json({ 
                            success: false,
                            message: "Grupo creado pero falló al obtener miembros",
                            error: err.message 
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Grupo creado exitosamente",
                        grupo: {
                            ...grupoCreado[0],
                            miembros: miembrosGrupo
                        }
                    });
                }
            );
        }
    );
}
router.get("/usuario/:userId/grupos", (req, res) => {
    const userId = req.params.userId;

    if (isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: "El ID de usuario debe ser un número válido"
        });
    }

    const query = `
        SELECT 
            g.id, 
            g.nombre, 
            g.descripcion, 
            g.created_at,
            g.creador_id,
            u.nombre AS creador_nombre,
            u.avatar_url AS creador_avatar,
            TRUE AS es_creador
        FROM 
            Grupos g
        JOIN 
            Usuarios u ON g.creador_id = u.id
        WHERE 
            g.creador_id = ?
        
        UNION
        
        SELECT 
            g.id, 
            g.nombre, 
            g.descripcion, 
            g.created_at,
            g.creador_id,
            u.nombre AS creador_nombre,
            u.avatar_url AS creador_avatar,
            FALSE AS es_creador
        FROM 
            Grupos g
        JOIN 
            MiembrosGrupo mg ON g.id = mg.grupo_id
        JOIN 
            Usuarios u ON g.creador_id = u.id
        WHERE 
            mg.usuario_id = ?
        AND 
            g.creador_id != ?
    `;

    db.query(query, [userId, userId, userId], (err, results) => {
        if (err) {
            console.error("Error al obtener grupos:", err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener los grupos del usuario",
                error: err.message
            });
        }

        const gruposComoCreador = results.filter(g => g.es_creador);
        const gruposComoMiembro = results.filter(g => !g.es_creador);

        res.json({
            success: true,
            data: {
                todos_los_grupos: results,
                como_creador: gruposComoCreador,
                como_miembro: gruposComoMiembro,
                total_grupos: results.length
            }
        });
    });
});
router.delete("/grupos/:id", (req, res) => {
    const grupoId = parseInt(req.params.id);

    if (isNaN(grupoId)) {
        return res.status(400).json({
            success: false,
            message: "ID de grupo inválido"
        });
    }

    const query = `
        DELETE FROM Grupos
        WHERE id = ?
    `;

    db.query(query, [grupoId], (err, result) => {
        if (err) {
            console.error("Error al eliminar grupo:", err);
            return res.status(500).json({
                success: false,
                message: "Error al eliminar el grupo",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Grupo no encontrado"
            });
        }

        res.json({
            success: true,
            message: "Grupo eliminado correctamente"
        });
    });
});
router.get("/grupos/:grupoId/puntos", (req, res) => {
    const grupoId = req.params.grupoId;

    if (isNaN(grupoId)) {
        return res.status(400).json({
            success: false,
            message: "ID de grupo inválido"
        });
    }

    const query = `
        SELECT 
            u.id AS usuario_id,
            u.nombre,
            u.email,
            u.avatar_url,
            COALESCE(SUM(r.puntos), 0) AS puntos_totales
        FROM MiembrosGrupo mg
        JOIN Usuarios u ON mg.usuario_id = u.id
        LEFT JOIN Recompensas r ON r.usuario_id = u.id
        WHERE mg.grupo_id = ?
        GROUP BY u.id, u.nombre, u.email, u.avatar_url
        ORDER BY puntos_totales DESC
    `;

    db.query(query, [grupoId], (err, results) => {
        if (err) {
            console.error("Error al obtener puntos del grupo:", err);
            return res.status(500).json({
                success: false,
                message: "Error en el servidor",
                error: err.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});




//Endpoints Tareas
router.post("/create/tarea", (req, res) => {
    const { titulo, descripcion, grupo_id, creador_id, fecha_limite, puntuacion } = req.body;

    if (!titulo || !grupo_id || !creador_id) {
        return res.status(400).json({
            success: false,
            message: "Título, ID del grupo y ID del creador son requeridos"
        });
    }


    const query = `
        INSERT INTO Tareas (titulo, descripcion, grupo_id, creador_id, fecha_limite, puntos)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [titulo, descripcion || null, grupo_id, creador_id, fecha_limite || null, puntuacion || 0],
        (err, result) => {
            if (err) {
                console.error("Error al crear tarea:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error al crear la tarea",
                    error: err.message
                });
            }

            return res.status(201).json({
                success: true,
                message: "Tarea creada correctamente",
                tarea_id: result.insertId
            });
        }
    );
});

router.get("/tareas/:grupoId/:idUsuario", (req, res) => {
    const grupoId = parseInt(req.params.grupoId);
    const idUsuario = parseInt(req.params.idUsuario);

    if (isNaN(grupoId) || isNaN(idUsuario)) {
        return res.status(400).json({
            success: false,
            message: "ID de grupo o usuario inválido"
        });
    }

    const query = `
        SELECT 
            t.id, 
            t.titulo, 
            t.descripcion, 
            t.fecha_limite, 
            t.creador_id, 
            u.nombre AS creador_nombre, 
            t.puntos,
            CASE 
                WHEN tu.id IS NOT NULL THEN TRUE 
                ELSE FALSE 
            END AS completada
        FROM Tareas t
        JOIN Usuarios u ON t.creador_id = u.id
        LEFT JOIN Tareas_Usuarios tu ON tu.tarea_id = t.id AND tu.usuario_id = ?
        WHERE t.grupo_id = ?
    `;

    db.query(query, [idUsuario, grupoId], (err, results) => {
        if (err) {
            console.error("Error al obtener tareas:", err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener las tareas",
                error: err.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});

router.put("/tareas/:idTarea/:idUsuario/completar", (req, res) => {
    const { idTarea, idUsuario } = req.params;

    // Verifica si ya existe la tarea completada por el usuario
    const checkQuery = `
        SELECT * FROM Tareas_Usuarios WHERE tarea_id = ? AND usuario_id = ?
    `;

    db.query(checkQuery, [idTarea, idUsuario], (err, results) => {
        if (err) {
            console.error("Error al verificar tarea:", err);
            return res.status(500).json({ success: false, message: "Error en la base de datos" });
        }

        // Si ya existe => descompletar
        if (results.length > 0) {
            // Obtener puntos de la tarea
            db.query("SELECT puntos FROM Tareas WHERE id = ?", [idTarea], (err, tareaRes) => {
                if (err || tareaRes.length === 0) {
                    return res.status(500).json({ success: false, message: "Error al obtener tarea" });
                }

                const puntos = tareaRes[0].puntos;

                // Eliminar de Tareas_Usuarios
                db.query("DELETE FROM Tareas_Usuarios WHERE tarea_id = ? AND usuario_id = ?", [idTarea, idUsuario], (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: "Error al descompletar tarea" });
                    }

                    // Restar puntos en Recompensas
                    db.query(`
                        UPDATE Recompensas SET puntos = GREATEST(0, puntos - ?) 
                        WHERE usuario_id = ?
                    `, [puntos, idUsuario], (err) => {
                        if (err) {
                            return res.status(500).json({ success: false, message: "Error al restar puntos" });
                        }

                        return res.status(200).json({ success: true, message: "Tarea descompletada y puntos actualizados" });
                    });
                });
            });
        } else {
            // No existe => completar tarea

            // Obtener puntos de la tarea
            db.query("SELECT puntos FROM Tareas WHERE id = ?", [idTarea], (err, tareaRes) => {
                if (err || tareaRes.length === 0) {
                    return res.status(404).json({ success: false, message: "Tarea no encontrada" });
                }

                const puntos = tareaRes[0].puntos;

                // Insertar en Tareas_Usuarios
                db.query("INSERT INTO Tareas_Usuarios (tarea_id, usuario_id) VALUES (?, ?)", [idTarea, idUsuario], (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: "Error al registrar la tarea como completada" });
                    }

                    // Sumar puntos, sin pasarse de 1000
                    db.query(`
                        INSERT INTO Recompensas (usuario_id, puntos)
                        VALUES (?, ?)
                        ON DUPLICATE KEY UPDATE puntos = LEAST(1000, puntos + ?)
                    `, [idUsuario, puntos, puntos], (err) => {
                        if (err) {
                            return res.status(500).json({ success: false, message: "Error al asignar puntos" });
                        }

                        return res.status(200).json({ success: true, message: "Tarea completada y puntos actualizados" });
                    });
                });
            });
        }
    });
});

router.delete("/tareas/:id", (req, res) => {
    const idTarea = req.params.id;

    db.query("DELETE FROM Tareas WHERE id = ?", [idTarea], (err, result) => {
        if (err) {
            console.error("Error al eliminar tarea:", err);
            return res.status(500).json({ success: false, message: "Error al eliminar tarea" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Tarea no encontrada" });
        }

        return res.status(200).json({ success: true, message: "Tarea eliminada correctamente" });
    });
});


module.exports = router;
