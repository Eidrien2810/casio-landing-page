import express from 'express';
import cors from 'cors';
import { crearContribuyente, editarContribuyente, crearComprobante, editarComprobante, getComprobantes, getContribuyentes, getDirecciones, eliminarComprobante, eliminarContribuyente } from './utils.js';

const server = express();
server.use(cors());
server.use(express.json());

server.options('/api/contribuyentes', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204); // No Content
});


server.get('/', (req, res) => {
  res.send(`<a href="/api/contribuyentes">Contribuyentes</a><br/><a href="/api/comprobantes">Comprobantes</a>`);
});

server.get('/api/contribuyentes', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    const contribuyentes = await getContribuyentes();
    const direcciones = await getDirecciones();
    const newContribuyentes = contribuyentes.recordset.map(obj => {
      const Direccion = direcciones.recordset.find(dir => obj.DireccionId === dir.DireccionId);
      return {
        ...obj,
        Direccion
      };
    });
    res.json(newContribuyentes);
  } catch (error) {
    res.status(500).send('Error al obtener los contribuyentes');
  }
});

server.get('/api/comprobantes', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    const comprobantes = await getComprobantes();
    res.json(comprobantes.recordset);
  } catch (error) {
    res.status(500).send('Error al obtener los comprobantes');
  }
});

server.post('/api/contribuyentes', async (req, res) => {
  try {
    const {
      RncCedula,
      Nombre,
      Apellido,
      Tipo,
      Estatus,
      Telefono,
      Email,
      FechaRegistro,
      DireccionId
    } = req.body;

    // Insertar el nuevo contribuyente en la base de datos
    await crearContribuyente(RncCedula, Nombre, Apellido, Tipo, Estatus, Telefono, Email, FechaRegistro, DireccionId);

    // Enviar una respuesta de éxito
    res.status(201).send('Contribuyente creado correctamente');
  } catch (error) {
    // Manejar errores y enviar una respuesta de error al cliente
    console.error(error);
    res.status(500).send('Error al crear el contribuyente');
  }
});

server.put('/api/contribuyentes', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    const {
      ContribuyenteId,
      RncCedula,
      Nombre,
      Apellido,
      Tipo,
      Estatus,
      Telefono,
      Email,
      FechaRegistro,
      DireccionId
    } = req.body;

    // Actualizar el contribuyente en la base de datos
    await editarContribuyente(ContribuyenteId, RncCedula, Nombre, Apellido, Tipo, Estatus, Telefono, Email, FechaRegistro, DireccionId);

    // Enviar una respuesta de éxito
    res.status(200).send('Contribuyente actualizado correctamente');
  } catch (error) {
    // Manejar errores y enviar una respuesta de error al cliente
    console.error(error);
    res.status(500).send('Error al actualizar el contribuyente');
  }
});

const PORT = process.env.PORT ?? 1234;

server.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT} at ${Date()}`);
});

server.put('/api/comprobantes', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    const {
      ComprobanteId,
      Ncf,
      RncCedula,
      Monto,
      Itbis,
      FechaEmision,
      Tipo,
      Estado,
      TasaItbis
    } = req.body;

    // Actualizar el comprobante en la base de datos
    await editarComprobante(ComprobanteId, Ncf, RncCedula, Monto, Itbis, FechaEmision, Tipo, Estado, TasaItbis);
    console.log('put', req.body)
    // Enviar una respuesta de éxito
    res.status(200).send('Comprobante actualizado correctamente');
  } catch (error) {
    // Manejar errores y enviar una respuesta de error al cliente
    console.error(error);
    res.status(500).send('Error al actualizar el Comprobante');
  }
});

server.post('/api/comprobantes', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    const {
      RncCedula,
      Ncf,
      Monto,
      Itbis,
      FechaEmision,
      Tipo,
      Estado,
      TasaItbis
    } = req.body;

    // Insertar el nuevo comprobante en la base de datos
    await crearComprobante(RncCedula, Ncf, Monto, Itbis, FechaEmision, Tipo, Estado, TasaItbis);
    console.log('post', req.body)
    // Enviar una respuesta de éxito
    res.status(200).send('Comprobante creado correctamente');
  } catch (error) {
    // Manejar errores y enviar una respuesta de error al cliente
    console.error(error);
    res.status(500).send('Error al crear el Comprobante');
  }
});

server.delete('/api/comprobantes', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    const {
      ComprobanteId
    } = req.body;

    // Insertar el nuevo comprobante en la base de datos
    await eliminarComprobante(ComprobanteId)
    // Enviar una respuesta de éxito
    res.status(200).send('Comprobante eliminado correctamente');
  } catch (error) {
    // Manejar errores y enviar una respuesta de error al cliente
    console.error(error);
    res.status(500).send('Error al eliminar el Comprobante');
  }
});
server.delete('/api/contribuyentes', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    const {
      ContribuyenteId
    } = req.body;

    // Insertar el nuevo comprobante en la base de datos
    await eliminarContribuyente(ContribuyenteId)
    // Enviar una respuesta de éxito
    res.status(200).send('Contribuyente eliminado correctamente');
  } catch (error) {
    // Manejar errores y enviar una respuesta de error al cliente
    console.error(error);
    res.status(500).send('Error al eliminar el Contribuyente');
  }
});