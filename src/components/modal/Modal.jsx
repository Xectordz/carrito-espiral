import React, { useEffect, useState } from 'react';
import styles from "../modal/modal.module.css";
import { IoMdClose } from "react-icons/io";
import { MdAddShoppingCart } from "react-icons/md";
import { useCarrito } from "../../context/CarritoContext";
import ModalLotes from './modalLotes/ModalLotes';

export default function Modal({
  articuloCarrito,
  handleSubmit,
  closeModal,
  alertaModal,
  lotesArticulos,
  setLotesArticulos,
  cantidad, setCantidad, notas, setNotas, total, descuento, setDescuento, precioArticulo, setPrecioArticulo
}) {
  
  const { apiURL } = useCarrito();
  const [lotes, setLotes] = useState([]);
  const [cantidadPorLote, setCantidadPorLote] = useState({});
  const [mostrarModalLotes, setMostrarModalLotes] = useState(false);


  useEffect(() => {
    fetch(`${apiURL}/get_lotes_json/${articuloCarrito.articuloid}`)
      .then(res => res.json())
      .then(data => setLotes(data));
  }, [apiURL, articuloCarrito.articuloid]);

  

  const handleCantidadLoteChange = (nomalmacen, artdiscretoid, loteClave, value) => {
    const lote = lotes.find(l => l.clave === loteClave);

    if (lote && value <= lote.existencia) {
      setCantidadPorLote(prev => ({
        ...prev,
        [loteClave]: value
      }));

      setLotesArticulos(prev => {
        const index = prev.findIndex(item => item.artdiscretoid === artdiscretoid);

        if (index === -1) {
          return [
            ...prev,
            { nomalmacen, artdiscretoid, cantidadLote: value, "clave": loteClave }
          ];
        } else {
          const newLotesArticulos = [...prev];
          newLotesArticulos[index] = { ...newLotesArticulos[index], cantidadLote: value };
          return newLotesArticulos;
        }
      });
    }
  };

  const calcularTotalCantidadSeleccionada = () => {
    return Object.values(cantidadPorLote).reduce((acc, curr) => acc + curr, 0);
  };

  const esCantidadValida = calcularTotalCantidadSeleccionada() === Number(cantidad);

  

  const formatearCantidad = (cantidad) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cantidad);
  };

  // Función para abrir el modal de lotes
  const abrirModalLotes = () => {
    setMostrarModalLotes(true);
  };

  // Función para cerrar el modal de lotes
  const cerrarModalLotes = () => {
    setMostrarModalLotes(false);
  };

  return (
    <>
      <div className="overlay" />
      <div className={styles.container}>
        <form className={styles.modal} onSubmit={handleSubmit}>

          <div className={styles.articulo_nombre}>
            <h5>{articuloCarrito.nombre}</h5>
            <p onClick={closeModal} className={styles.btn_cerrar}>
              <IoMdClose />
            </p>
          </div>

          <div className={styles.div_modal}>
            <div className={styles.campos}>

              <img className={styles.articulo_img} src={articuloCarrito.imagen} alt="" />
              <p className={styles.articulo_descripcion}>
                {articuloCarrito.descripcion}
              </p>

              <div className={styles.div_campos}>
                <div className={styles.div_cantidad}>
                  <label htmlFor="cantidad">Cantidad:</label>
                  <input
                    type="text"
                    id="cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className={styles.div_precio}>
                  <label htmlFor='precio' className={styles.precio}>Precio:</label>
                  <input
                    onChange={(e) => setPrecioArticulo(e.target.value)}
                    id='precio'
                    value={`${precioArticulo}`}
                    type="text"
                    autoComplete="off"
                  />
                </div>

                <div className={styles.div_precio}>
                  <label htmlFor='dcto'>Descuento:</label>
                  <input
                    id='dcto'
                    onChange={(e) => setDescuento(e.target.value)}
                    value={descuento}
                    type="text"
                    autoComplete="off"
                  />
                </div>
              </div>
              {
                alertaModal && (
                  <p className={styles.obligatorios}>{alertaModal}</p>
                )
              }
            </div>

            {/* Botón para abrir el modal de lotes */}
            {
              lotes.length > 0 && (
                <div className={styles.div_lotesDisponibles}>
                  <p>Lotes Disponibles: {lotes.length}</p>
                  <p className={styles.seleccionar_lote} onClick={abrirModalLotes}>{"Seleccionar Lotes"}</p>
                </div>
              )
            }

            {/* Modal de lotes */}
            {mostrarModalLotes && (
              <>
                <ModalLotes
                  cantidad={cantidad}
                  lotes={lotes}
                  cantidadPorLote={cantidadPorLote}
                  handleCantidadLoteChange={handleCantidadLoteChange}
                  cerrarModalLotes={cerrarModalLotes}
                />
              </>
            )}



            <div className={styles.campos}>
              <label htmlFor="notas">Notas:</label>
              <textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder='Escribe una nota aquí'
              />
            </div>

            <div className={styles.total}>
              <h3>Total: $<span>{formatearCantidad(total)}</span></h3>
              {lotes.length !== 0 && !esCantidadValida && (
                <p style={{ color: "red", textAlign: "center" }}>La cantidad total no coincide con la suma de las cantidades por lote.</p>
              )}
            </div>

            <button type="submit" disabled={lotes.length !== 0 ? !esCantidadValida : false}>Agregar al Carrito <MdAddShoppingCart /></button>
          </div>

        </form>

      </div>
    </>
  );
}
