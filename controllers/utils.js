import { getConnection, mssql } from '../config/sql_conection.mjs'

export const getComprobantes = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('exec mostrarComprobantes');
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const getContribuyentes = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('exec mostrarContribuyentes');
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const getDirecciones = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('exec mostrarDirecciones');
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const editarContribuyente = async (ContribuyenteId, RncCedula, Nombre, Apellido, Tipo, Estatus, Telefono, Email, FechaRegistro, 
  DireccionId
) => {
  console.log('editarContribuyente')
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Adding parameters to prevent SQL Injection
    request.input('ContribuyenteId', mssql.Int, ContribuyenteId);
    request.input('RncCedula', mssql.Int, RncCedula);
    request.input('Nombre', mssql.VarChar, Nombre);
    request.input('Apellido', mssql.VarChar, Apellido);
    request.input('Tipo', mssql.VarChar, Tipo);
    request.input('Estatus', mssql.VarChar, Estatus);
    request.input('Telefono', mssql.VarChar, Telefono);
    request.input('Email', mssql.VarChar, Email);
    request.input('FechaRegistro', mssql.Date, FechaRegistro);
    request.input('DireccionId', mssql.Int, DireccionId);

    const result = await request.execute('editarContribuyente');
    
    return result;
  } catch (error) {
    console.error(error);
    throw error; // rethrow the error after logging
  }
}

export const crearContribuyente = async (RncCedula, Nombre, Apellido, Tipo, Estatus, Telefono, Email, FechaRegistro, DireccionId) => {
  console.log('crearContribuyente')
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Adding parameters to prevent SQL Injection
    request.input('RncCedula', mssql.VarChar, RncCedula);
    request.input('Nombre', mssql.VarChar, Nombre);
    request.input('Apellido', mssql.VarChar, Apellido);
    request.input('Tipo', mssql.VarChar, Tipo);
    request.input('Estatus', mssql.VarChar, Estatus);
    request.input('Telefono', mssql.VarChar, Telefono);
    request.input('Email', mssql.VarChar, Email);
    request.input('FechaRegistro', mssql.Date, FechaRegistro);
    request.input('DireccionId', mssql.Int, DireccionId);

    const result = await request.execute('crearContribuyente');
    return result;
  } catch (error) {
    console.error(error);
    throw error; // rethrow the error after logging
  }
}

export const crearComprobante = async (RncCedula, Ncf, Monto, Itbis, FechaEmision, Tipo, Estado, TasaItbis) => {
  console.log('crearComprobante')
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Adding parameters to prevent SQL Injection
    request.input('NCF', mssql.VarChar, Ncf);
    request.input('RncCedula', mssql.Int, RncCedula);
    request.input('Monto', mssql.Decimal, Monto);
    request.input('Itbis', mssql.Decimal, Itbis);
    request.input('TipoComprobante', mssql.VarChar, Tipo);
    request.input('FechaEmision', mssql.VarChar, FechaEmision);
    request.input('Estado', mssql.VarChar, Estado);
    request.input('TasaItbis', mssql.VarChar, TasaItbis);

    const result = await request.execute('insertarComprobante');
    return result;
  } catch (error) {
    console.error(error);
    throw error; // rethrow the error after logging
  }
}

export const editarComprobante = async (ComprobanteId, Ncf, RncCedula, Monto, Itbis, FechaEmision, Tipo, Estado, TasaItbis) => {
  console.log('editarComprobante')
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Adding parameters to prevent SQL Injection
    request.input('ComprobanteId', mssql.Int, ComprobanteId);
    request.input('NCF', mssql.VarChar, Ncf);
    request.input('Monto', mssql.Decimal, Monto);
    request.input('Itbis', mssql.Decimal, Itbis);
    request.input('FechaEmision', mssql.VarChar, FechaEmision);
    request.input('TipoComprobante', mssql.VarChar, Tipo);
    request.input('Estado', mssql.VarChar, Estado);
    request.input('TasaItbis', mssql.VarChar, TasaItbis);

    const result = await request.execute('editarComprobante');
    
    return result;
  } catch (error) {
    console.error(error);
    throw error; // rethrow the error after logging
  }
}

export const eliminarComprobante = async (ComprobanteId) => {
  console.log('eliminarComprobante')
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Adding parameters to prevent SQL Injection
    request.input('ComprobanteId', mssql.Int, ComprobanteId);

    const result = await request.execute('eliminarComprobante');
    
    return result;
  } catch (error) {
    console.error(error);
    throw error; // rethrow the error after logging
  }
}
export const eliminarContribuyente = async (ContribuyenteId) => {
  console.log('eliminarContribuyente')
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Adding parameters to prevent SQL Injection
    request.input('ContribuyenteId', mssql.Int, ContribuyenteId);

    const result = await request.execute('eliminarContribuyente');
    
    return result;
  } catch (error) {
    console.error(error);
    throw error; // rethrow the error after logging
  }
}