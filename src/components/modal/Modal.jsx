import React, { useEffect, useState } from 'react';
import styles from "../modal/modal.module.css";
import { IoMdClose } from "react-icons/io";
import { MdAddShoppingCart } from "react-icons/md";
import img from "../../../public/tv.jpg";
import { HiAtSymbol } from 'react-icons/hi';
import { useCarrito } from "../../context/CarritoContext";

export default function Modal({
  articuloCarrito,
  handleSubmit,
  closeModal,
  alertaModal,
  lotesArticulos,
  setLotesArticulos,
  cantidad, setCantidad, notas, setNotas, total, descuento, setDescuento, precioArticulo, setPrecioArticulo
}) {
  const { apiURL,  } = useCarrito();
  const [loteSeleccionado, setLoteSeleccionado] = useState(null); // Estado para manejar el lote seleccionado
  const [lote, setLote] = useState("");
  const [lotes, setLotes] = useState([]);
  const [cantidadPorLote, setCantidadPorLote] = useState({});  // Estado para la cantidad seleccionada por lote
  
  useEffect(()=>{
    
    fetch(`${apiURL}/get_lotes_json/${articuloCarrito.Articulo_id}`)
      .then(res=>res.json())
      .then(data=>setLotes(data));

  }, []);

  

  const changeLote = (lote) => {
    setLoteSeleccionado(lote);  // Cambia el lote seleccionado
    setLote(lote);              // Cambia el lote activo
  };

  // Manejador para cambiar la cantidad en un lote específico
  const handleCantidadLoteChange = (nomalmacen, artdiscretoid, loteClave, value) => {
    // Asegurarse de que no se sobrepase la disponibilidad
    const lote = lotes.find(l => l.clave === loteClave);
  
    if (lote && value <= lote.existencia) {
      // Actualiza cantidadPorLote
      setCantidadPorLote(prev => ({
        ...prev,
        [loteClave]: value
      }));
  
      // Actualiza lotesArticulos solo si el artículo no existe en el array
      setLotesArticulos(prev => {
        const index = prev.findIndex(item => item.artdiscretoid === artdiscretoid);
  
        if (index === -1) {
          // Si no existe, agregar nuevo artículo
          return [
            ...prev,
            { nomalmacen, artdiscretoid, cantidadLote: value, "clave":loteClave }
          ];
        } else {
          // Si ya existe, actualizar la cantidad
          const newLotesArticulos = [...prev];
          newLotesArticulos[index] = { ...newLotesArticulos[index], cantidadLote: value };
          return newLotesArticulos;
        }
      });
    }
  };
  
  

  // Calcular el total seleccionado en base a las cantidades por lote
  const calcularTotalCantidadSeleccionada = () => {
    return Object.values(cantidadPorLote).reduce((acc, curr) => acc + curr, 0);
  };

  // Verifica si el total de las cantidades por lote coincide con la cantidad total seleccionada
  const esCantidadValida = calcularTotalCantidadSeleccionada() === cantidad;
  
  // formatear la fecha que trae el lote
  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha); // Convierte la fecha a un objeto Date
    return fechaObj.toLocaleDateString('es-ES'); // Devuelve la fecha en formato 'dd/mm/yyyy'
  };

  return (
    <>
      <div className="overlay" />
      <form className={styles.modal} onSubmit={handleSubmit}>
        
        <div className={styles.articulo_nombre}>
          <h5>{articuloCarrito.Nombre}</h5>
          <p onClick={closeModal} className={styles.btn_cerrar}>
            <IoMdClose />
          </p>
        </div>
      
        <div className={styles.div_modal}>
          <div className={styles.campos}>
            <img className={styles.articulo_img} src={img} alt="" />
            <p className={styles.articulo_descripcion}>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nisi doloremque accusantium at architecto optio nam quam velit voluptas facere veritatis, odit ad odio reiciendis eligendi libero animi. Fugiat, soluta a?
            </p>
            
            <div className={styles.div_campos}>
              <div className={styles.div_cantidad}>
                <label htmlFor="cantidad">Cantidad:</label>
                <input
                  type="number"
                  id="cantidad"
                  value={cantidad}
                  min="1"
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </div>
              
              <div className={styles.div_precio}>
                <label htmlFor='precio' className={styles.precio}>Precio:</label>
                <input 
                  onChange={(e) => setPrecioArticulo(e.target.value)} 
                  id='precio'
                  min="1" 
                  value={`${precioArticulo}`} 
                  type="number" 
                />
              </div>

              <div className={styles.div_precio}>
                <label htmlFor='dcto'>Descuento:</label>
                <input 
                id='dcto'
                  onChange={(e) => setDescuento(e.target.value)} 
                  value={descuento} 
                  type="number" 
                />
              </div>
            </div>
          </div>

          
          <div className={styles.lotes_div}>
            {lotes.map((lote, index) => (
              <div 
                key={index} 
                onClick={() => changeLote(lote)} 
                className={`${styles.lote} ${loteSeleccionado?.clave === lote.clave ? styles.selected : ''}`} // Aplica clase 'selected' si el lote es el seleccionado
              >
                <div className={styles.lote_row}>
                  <div className={styles.lote_radio}>
                    <label htmlFor={lote.nombre}>{lote.nomalmacen}</label>
                  </div>
                  <div className={styles.disponibles}>
                    <p>Disponibles: <span>{lote.existencia}</span></p>
                  </div>
                </div>

                <div className={styles.lote_row}>
                  <p>Fecha: <span>{formatearFecha(lote.fecha)}</span></p>
                </div>
                <div className={styles.lote_input}>
                    <label>Cantidad de este lote:</label>
                    <input 
                      type="number"
                      max={cantidad} 
                      min={0}
                      value={cantidadPorLote[lote.clave] || 0} 
                      onChange={(e) => handleCantidadLoteChange(lote.nomalmacen, lote.artdiscretoid, lote.clave, Math.min(e.target.value, lote.existencia))}
                    />
                  </div>
              </div>
            ))}
          </div>
          

          <div className={styles.campos}>
            <label htmlFor="notas">Notas:</label>
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

          
          {/* Verificación de cantidad válida */}
          
          <div className={styles.total}>
            <h3>Total: $<span>{total}</span></h3>
            {lotes.length !== 0 && !esCantidadValida && (
              <p style={{ color: "red", textAlign:"center" }}>La cantidad total no coincide con la suma de las cantidades por lote.</p>
            )}
          </div>
          

          <button type="submit" disabled={lotes.length !== 0 ? !esCantidadValida : false}>Agregar al Carrito <MdAddShoppingCart /></button>
        </div>
      </form>

      {/* Alerta */}
      <div className={`alertaEliminar ${alertaModal && "mostrar"}`}>
        <p>Agrega al menos 1 articulo</p>
      </div>
    </>
  );
}




