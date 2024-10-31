import React, { createContext, useContext, useState, useEffect } from 'react';

// Crea el contexto
const CarritoContext = createContext();

// Proveedor del contexto
export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [alerta, setAlerta] = useState(false);
  const [view, setView] = useState(() => {
      const viewStorage = localStorage.getItem("view");
      return viewStorage ? JSON.parse(viewStorage) : { grid: true, row: false };
  });
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");
  const [precioArticulo, setPrecioArticulo] = useState(10);
  const [descuento, setDescuento] = useState(0);
  const [total, setTotal] = useState(0);
  const [cliente, setCliente] = useState(() => {
    const storedCliente = localStorage.getItem('cliente');
    return storedCliente ? JSON.parse(storedCliente) : { cliente: "Generico", fecha: "", obs: "", clave_cliente: "", cliente_id: "" };
  });
  const [usuario, setUsuario] = useState(() => {
    const storedUsuario = localStorage.getItem('usuario');
    return storedUsuario ? JSON.parse(storedUsuario) : null;
  });

  const apiURL = "http://192.168.1.125:3000";

  //
  useEffect(()=> {
    localStorage.setItem("view", JSON.stringify(view));
  }, [view])

  //almacenar usuario
  useEffect(() => {
    if (usuario) {
        localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
        localStorage.removeItem('usuario'); // Opcional: Eliminar si no hay usuario
    }
  }, [usuario]);

  // Efecto para almacenar el cliente en localStorage
  useEffect(() => {
    localStorage.setItem('cliente', JSON.stringify(cliente));
  }, [cliente]);

  useEffect(() => {
    try {
      const clienteGuardado = JSON.parse(localStorage.getItem('cliente'));
      const carritoGuardado = JSON.parse(localStorage.getItem('carrito'));
  
      if (clienteGuardado) {
        setCliente(clienteGuardado);
      } 
  
      if (carritoGuardado) {
        setCarrito(carritoGuardado);
      }
    } catch (error) {
      console.error('Error al recuperar datos del localStorage:', error);
    }
  }, []);
  

   /*funcion que calcula el precio de
    articulo por su cantidad*/
    useEffect(() => {
      const precioConDescuento = precioArticulo - (precioArticulo * (descuento / 100));
      setTotal(precioConDescuento * cantidad); // Calcular el total
  }, [cantidad, precioArticulo, descuento]);

  
  // Cuenta todos los artículos del carrito
  useEffect(() => {
    const actualizarCant = () => {
      const cantidad = carrito.reduce((total, item) => total + item.cantidad, 0);
      setCantidadCarrito(cantidad);
    };
    actualizarCant();
  }, [carrito, setCantidadCarrito]);


  // Función para agregar un artículo al carrito
  const handleAgregar = (producto) => {
    setCarrito(prevCarrito => {
      const existe = prevCarrito.find(item => item.Articulo_id === producto.Articulo_id);
      const nuevoCarrito = existe 
        ? prevCarrito.map(item =>
            item.Articulo_id === producto.Articulo_id ? { ...item, cantidad: item.cantidad + 1 } : item
          )
        : [...prevCarrito, { ...producto, cantidad: 1 }];
  
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito)); // Sincronizar con localStorage
      return nuevoCarrito;
    });
    setAlerta(true);
    setTimeout(() => {
      setAlerta(false);
    }, 2000);
  };
  

  return (
    <CarritoContext.Provider value={{ 
        carrito, 
        setCarrito, 
        cantidadCarrito, 
        setCantidadCarrito,
        alerta,
        setAlerta, 
        handleAgregar,
        view,
        setView, 
        cantidad,
        setCantidad,
        notas,
        setNotas,
        precioArticulo,
        setPrecioArticulo,
        descuento,
        setDescuento,
        total,
        setTotal,
        cliente,
        setCliente,
        apiURL,
        usuario, 
        setUsuario
      }}>

      {children}
      
    </CarritoContext.Provider>
  );
};

// Hook para usar el contexto
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
};

export default CarritoContext;


