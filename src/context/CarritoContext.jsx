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
  
  const [cliente, setCliente] = useState(() => {
    const storedCliente = localStorage.getItem('cliente');
    return storedCliente ? JSON.parse(storedCliente) : { cliente: "Generico", fecha: "", obs: "", clave_cliente: "", cliente_id: "" };
  });
  const [usuario, setUsuario] = useState(() => {
    const storedUsuario = localStorage.getItem('usuario');
    return storedUsuario ? JSON.parse(storedUsuario) : null;
  });

  const apiURL = "http://192.168.1.117:5000";

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
  

   

  
  // Cuenta todos los artículos del carrito
  useEffect(() => {
    const actualizarCant = () => {
      const cantidad = carrito.reduce((total, item) => total + item.cantGlobal, 0);
      setCantidadCarrito(cantidad);
    };
    actualizarCant();
  }, [carrito, setCantidadCarrito]);


  const handleAgregar = (producto) => {
  setCarrito(prevCarrito => {
    // Verificamos si el artículo ya existe en el carrito
    const existe = prevCarrito.find(item => item.Articulo_id === producto.Articulo_id);

    const nuevoCarrito = existe
      ? prevCarrito.map(item => {
          if (item.Articulo_id === producto.Articulo_id) {
            // Si el artículo ya existe, actualizamos sus lotes
            const nuevosLotes = producto.lotesArticulos.reduce((acumulador, loteProducto) => {
              // Buscar si el lote ya existe en el carrito
              const loteExistente = item.lotesArticulos.find(lote => lote.artdiscretoid === loteProducto.artdiscretoid);

              if (loteExistente) {
                // Si el lote ya existe, sumamos las cantidades
                acumulador.push({
                  ...loteExistente,
                  cantidadLote: loteExistente.cantidadLote + loteProducto.cantidadLote - 1
                });
              } else {
                // Si el lote no existe, lo agregamos con su cantidadLote original
                acumulador.push({
                  ...loteProducto,
                });
              }

              return acumulador;
            }, []); // Usamos reduce para acumular los lotes actualizados

            // Fusionamos los lotes existentes con los nuevos lotes
            const lotesActualizados = [
              ...item.lotesArticulos,  // Lotes previos
              ...nuevosLotes            // Nuevos lotes procesados
            ];

            // Eliminar duplicados, en caso de que algún lote ya haya sido sumado
            const lotesFinales = lotesActualizados.reduce((acc, lote) => {
              const exists = acc.find(l => l.artdiscretoid === lote.artdiscretoid);
              if (!exists) {
                acc.push(lote); // Solo agregamos el lote si no está ya en el acumulador
              } else {
                // Si el lote existe, sumamos la cantidadLote
                acc = acc.map(l => 
                  l.artdiscretoid === lote.artdiscretoid ? { ...l, cantidadLote: l.cantidadLote + lote.cantidadLote } : l
                );
              }
              return acc;
            }, []);

            return {
              ...item,
              cantGlobal: item.cantGlobal + producto.cantGlobal, // Sumamos la cantidad global
              lotesArticulos: lotesFinales // Actualizamos los lotes
            };
          }
          return item;
        })
      : [
          ...prevCarrito,
          { 
            ...producto, // Inicializamos el artículo con su cantidad y lotes
            lotesArticulos: producto.lotesArticulos.map(lote => ({
              ...lote, // Mantenemos los lotes con su cantidadLote original
            }))
          }
        ];

    // Sincronizamos el carrito con localStorage
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));

    return nuevoCarrito;
  });

  // Activar alerta de agregado al carrito
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


