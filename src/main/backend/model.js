import { DataTypes } from "sequelize";
import { DB } from "./db";

const Customer = DB.define('clientes', {
  Codigo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  Tipo_Cliente: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  Nombre_Representante: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  sexo: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  Cedula_RNC: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  Compañia: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  Direccion: {
    type: DataTypes.STRING(90),
    allowNull: true
  },
  Telefono: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  Balance: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  Limite_Credito: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  Ultima_Modificacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  Fecha_Creacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  Location: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  modified_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
},
{
    timestamps:false,
    tableName:'clientes'
});

const Venta = DB.define('ventas', {
  id_venta: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  Numero_Cliente: { type: DataTypes.INTEGER, allowNull: true },
  Nombre_Cliente: { type: DataTypes.STRING(60), allowNull: true },
  Telefono: { type: DataTypes.STRING(20), allowNull: true },
  Direccion: { type: DataTypes.STRING(500), allowNull: true },
  total: { type: DataTypes.DOUBLE, allowNull: true },
  total_Compra: { type: DataTypes.DOUBLE, allowNull: true },
  transporte: { type: DataTypes.DOUBLE, allowNull: true },
  descuento: { type: DataTypes.DOUBLE, allowNull: true },
  NCF: { type: DataTypes.STRING(12), allowNull: true },
  RNC_Cedula: { type: DataTypes.TEXT('medium'), allowNull: true },
  Pagado: { type: DataTypes.TINYINT, allowNull: true },
  Abono: { type: DataTypes.DOUBLE, allowNull: true },
  Entregado: { type: DataTypes.TINYINT, allowNull: true },
  Estado: { type: DataTypes.TINYINT, allowNull: true },
  ITBIS: { type: DataTypes.DOUBLE, allowNull: true },
  Cotizacion: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
  Metodo_Pago: { type: DataTypes.STRING(150), allowNull: true },
  Pago_con: { type: DataTypes.DOUBLE, allowNull: true, defaultValue: 0 },
  Location: { type: DataTypes.STRING(500), allowNull: true },
  Ultima_Modificacion: { type: DataTypes.DATE, allowNull: true },
  Fecha_Creacion: { type: DataTypes.DATE, allowNull: true },
  inUse: { type: DataTypes.TINYINT, allowNull: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: true },
  modified_by: { type: DataTypes.INTEGER, allowNull: true },
  Fecha_Factura: { type: DataTypes.DATE, allowNull: true },
  id_afiliado: { type: DataTypes.INTEGER, allowNull: true }
},{
    timestamps:false,
    tableName:'ventas'
});

const VentaArticulo = DB.define('ventas_articulos', {
  id_venta_articulo: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  id_venta: { type: DataTypes.INTEGER, allowNull: true },
  id_articulo: { type: DataTypes.BIGINT, allowNull: true },
  Cantidad: { type: DataTypes.DOUBLE, allowNull: true },
  precio_unitario: { type: DataTypes.DOUBLE, allowNull: true },
  subtotal_uni_compra: { type: DataTypes.DOUBLE, allowNull: true },
  ITBIS: { type: DataTypes.DOUBLE, allowNull: true },
  subtotal_uni: { type: DataTypes.DOUBLE, allowNull: true },
  Estado: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
  Entregado: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
  Descuento: { type: DataTypes.TINYINT, allowNull: true },
  Cantidad_Entregar: { type: DataTypes.DOUBLE, allowNull: true },
  Cotizacion: { type: DataTypes.TINYINT, allowNull: true },
  Guardado: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
  Fecha_Creacion: { type: DataTypes.DATE, allowNull: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: true },
  modified_by: { type: DataTypes.INTEGER, allowNull: true },
  stagedAdd: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
  stagedDelete: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 }
},{
    timestamps:false,
    tableName:'ventas_articulos'
});

export { Customer, Venta, VentaArticulo };