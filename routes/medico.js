var express = require('express');
var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener los medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    total: conteo,
                    medicos
                });
            })

        })
});

module.exports = app;

// CREAR MEDICO
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al obtener los medicos',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        })
    })
});

// ACTUALIZAR MEDICO
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id no existe',
                errors: { mensaje: 'El medico con el id no existe' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            })

        })

    })
});

// BORRAR MEDICO
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id no existe',
                errors: { mensaje: 'El medico con el id no existe' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    })
})