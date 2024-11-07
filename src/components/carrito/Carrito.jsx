import React, { useState, useEffect, useContext } from 'react';
import styles from "../carrito/carrito.module.css";
import { FaRegTrashAlt, FaEdit, FaCheck } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { BiLike } from "react-icons/bi";
import { jsPDF } from "jspdf";
import img from "../../../public/tv.jpg";
import { useCarrito } from "../../context/CarritoContext"
import { useNavigate } from 'react-router-dom';

export default function Carrito() {
  const [alerta, setAlerta] = useState(false);
  const [nota, setNota] = useState("");
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [editarArticulo, setEditarArticulo] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [total, setTotal] = useState();
  const navigate = useNavigate();

  const { carrito, setCarrito, cantidadCarrito, cliente } = useCarrito();


  const restarCantidad = (id) => {
    const index = carrito.findIndex(item => item.Articulo_id === id);
    if (index !== -1) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].cantidad -= 1;
      if (nuevoCarrito[index].cantidad === 0) {
        const carritoActualizado = nuevoCarrito.filter(item=>item.Articulo_id !== id);
        setCarrito(carritoActualizado);
        localStorage.setItem("carrito", JSON.stringify(carritoActualizado));
      }else{
        setCarrito(nuevoCarrito);
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
      }
      
    }
  };

  const sumarCantidad = (id) => {
    const index = carrito.findIndex(item => item.Articulo_id === id);
    if (index !== -1) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].cantidad += 1;
      setCarrito(nuevoCarrito);
      localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    }
  };

  const eliminarArticulo = (id) => {
    const nuevoCarrito = carrito.filter(item => item.Articulo_id !== id);
    setCarrito(nuevoCarrito);

    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const confirmarEliminar = () => {
    localStorage.removeItem("carrito");
    setCarrito([]);
    setAlerta(false);
    document.body.style.overflow = "";
  };

  const cancelarEliminar = () => {
    setAlerta(false);
    document.body.style.overflow = "";
  };

  const eliminarTodo = () => {
    setAlerta(true);
    document.body.style.overflow = "hidden";
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      if (item.lotesArticulos.length > 0) {
        // Si tiene lotes, sumamos los totales de cada lote
        const totalLotes = item.lotesArticulos.reduce((subtotal, lote) => {
          // Precio por lote (con descuento)
          const precioConDescuento = item.precioArticulo - (item.precioArticulo * item.descuento / 100);
          return subtotal + (precioConDescuento * lote.cantidadLote);
        }, 0);
        return total + totalLotes;
      } else {
        // Si no tiene lotes, solo usamos la cantidad total del artículo
        const precioConDescuento = item.precioArticulo - (item.precioArticulo * item.descuento / 100);
        return total + (precioConDescuento * item.cantidad);
      }
    }, 0).toFixed(2);
  };
  

  console.log(carrito)

  const handleComprar = () => {
      
      const detalles = carrito.map(item => ({
          'articuloId': item.Articulo_id,
          'claveArticulo': item.Clave_articulo,
          'unidades': item.lotesArticulos.length !== 0 ? item.cantGlobal : item.cantidad,
          'precioUnitario': item.precioArticulo,
          'dscto': item.descuento,
          'total': (item.precioArticulo * item.cantidad) - (item.precioArticulo * item.descuento / 100 * item.cantidad),
          'descripcion': item.Nombre,
          'notas': item.notas,
          "lotes" : item.lotesArticulos.map(lote=>({
              "artdiscretoid": lote.artdiscretoid,
              "cantidad" : lote.cantidadLote,
          }))
      }));
      const body = {
        'versionEsquema': 'N/D',
        'tipoComando': 'insac.doctos',
        'encabezado': {
            'clienteId': cliente.cliente_id,
            'claveCliente': cliente.clave_cliente,
            'fecha': new Date().toISOString(),
            'observaciones': cliente.obs || '',
            'subtotal': calcularTotal(),
            'impuesto': '0',
            'total': calcularTotal(),
        },
        'detalles': detalles,
      }
      console.log(JSON.stringify(body, null, 2));
      console.log(body);
      setCarrito([]);
      localStorage.removeItem("carrito");
      navigate("/");
  }
  /*
  const handleComprar = () => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text("ESPIRAL SISTEMAS", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente.cliente}`, 105, 30, { align: "center" });
    doc.setFontSize(18);
    doc.text("Ticket de venta", 105, 40, { align: "center" });
    doc.setFontSize(12);
    
    const fecha = new Date().toLocaleDateString();
    const ahora = new Date();
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();
    
    const formatearHora = (h, m, s) => {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    doc.text(`Observaciones: ${cliente.obs}`, 20, 55);
    doc.text(`Fecha de venta: ${fecha} - ${formatearHora(horas, minutos, segundos)}`, 20, 60);
    doc.setFontSize(12);
    doc.text("Folio: ", 20, 65);
    
    let yOffset = 80; // Offset para la posición Y de los artículos
    doc.setFontSize(14);
    const imgData = img; // Imagen en base64

    carrito.forEach((item, index) => {
        const totalArticulo = (item.precioArticulo * item.cantidad) - ((item.precioArticulo * item.descuento / 100) * item.cantidad);
        doc.addImage(imgData, 'JPEG', 20, yOffset - 10, 15, 15);
        doc.text(`${item.Nombre}`, 45, yOffset - 5);
        doc.text(`Cant. ${item.cantidad} - $${item.precioArticulo} - Descuento: ${item.descuento}%`, 20, yOffset + 10);
        doc.text(`Total: $${totalArticulo.toFixed(2)}`, 20, yOffset + 15);
        doc.text(`Notas: ${item.notas}`, 20, yOffset + 20);
        doc.text("------------------------", 20, yOffset + 25);
        
        // Aumentar el offset para el siguiente artículo
        yOffset += 40;

        // Comprobar si se ha llegado al final de la página
        if (yOffset > 250) { // 250 es un ejemplo, puedes ajustar según sea necesario
            doc.addPage(); // Añadir una nueva página
            yOffset = 20; // Reiniciar el offset para la nueva página
        }
    });

    const totalCompra = calcularTotal();
    doc.setFontSize(16);
    doc.text(`TOTAL: $${totalCompra}`, 20, yOffset);
    
    setPreviewUrl(doc.output('bloburl')); // Retorna la URL para la previsualización
    console.log(carrito);
  };
  */



  const descargarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text("ESPIRAL SISTEMAS", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente.cliente}`, 105, 30, { align: "center" });
    doc.setFontSize(18);
    doc.text("Ticket de venta", 105, 40, { align: "center" });
    doc.setFontSize(12);
    
    const fecha = new Date().toLocaleDateString();
    const ahora = new Date();
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();
    
    const formatearHora = (h, m, s) => {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    doc.text(`Observaciones: ${cliente.obs}`, 20, 55);
    doc.text(`Fecha de venta: ${fecha} - ${formatearHora(horas, minutos, segundos)}`, 20, 60);
    doc.setFontSize(12);
    doc.text("Folio: ", 20, 65);
    
    let yOffset = 80; // Offset para la posición Y de los artículos
    doc.setFontSize(14);
    const imgData = img; // Imagen en base64

    carrito.forEach((item, index) => {
        const totalArticulo = (item.precioArticulo * item.cantidad) - ((item.precioArticulo * item.descuento / 100) * item.cantidad);
        doc.addImage(imgData, 'JPEG', 20, yOffset - 10, 15, 15);
        doc.text(`${item.Nombre}`, 45, yOffset - 5);
        doc.text(`Cant. ${item.cantidad} - $${item.precioArticulo} - Descuento: ${item.descuento}%`, 20, yOffset + 10);
        doc.text(`Total: $${totalArticulo.toFixed(2)}`, 20, yOffset + 15);
        doc.text(`Notas: ${item.notas}`, 20, yOffset + 20);
        doc.text("------------------------", 20, yOffset + 25);
        
        // Aumentar el offset para el siguiente artículo
        yOffset += 40;

        // Comprobar si se ha llegado al final de la página
        if (yOffset > 250) { // 250 es un ejemplo, puedes ajustar según sea necesario
            doc.addPage(); // Añadir una nueva página
            yOffset = 20; // Reiniciar el offset para la nueva página
        }
    });

    const totalCompra = calcularTotal();
    doc.setFontSize(16);
    doc.text(`TOTAL: $${totalCompra}`, 20, yOffset);

    doc.save("ticket_compra.pdf");

    setCarrito([]);
    setPreviewUrl("");
};


  const handleEditarArticulo = (item) => {
    setArticuloEditando(item.Articulo_id);
    setNota(item.notas);
    setPrecio(item.precioArticulo);
    setDescuento(item.descuento);
    setCantidad(item.cantGlobal);
    setEditarArticulo(true);
  };

  useEffect(() => {
    document.body.style.overflow = editarArticulo ? 'hidden' : 'unset';
  }, [editarArticulo]);

  const handleGuardarArticulo = (item) => {
    const editado = carrito.map(articulo =>
      articulo.Articulo_id === item.Articulo_id
        ? { ...articulo, notas: nota.trim(), precioArticulo: precio, descuento: descuento, cantidad: cantidad }
        : articulo
    );
    setCarrito(editado);
    localStorage.setItem("carrito", JSON.stringify(editado));
    setNota("");
    setEditarArticulo(false);
    setArticuloEditando(null);
  };

  return (
    <>
      {!previewUrl ? (
        <div className={styles.carrito_contenedor}>
          <h3>Carrito</h3>
          {carrito.length > 0 && (
            <div className={styles.div_eliminarTodo}>
              <p onClick={eliminarTodo} className={styles.eliminarTodo}><FaRegTrashAlt />Eliminar todo</p>
            </div>
          )}
          <div className={styles.div_articulos}>
            {carrito.length > 0 && (
              <div className={styles.resumen_contenedor}>
                <div>
                  <p>Articulos: ({cantidadCarrito})</p>
                  <p>Total del Carrito: ${calcularTotal()}</p>
                </div>
                <button onClick={handleComprar}>Comprar</button>
              </div>
            )}
            {carrito.length > 0 ? carrito.map((item, index) => (
              <div 
                  key={index} 
                  className={styles.articulos_contenedor}
              >
                <p className={styles.articulo_nombre}>{item.Nombre}</p>
                <div className={styles.articulo_contenedor}>
                  <div className={styles.div_articulo}>
                    <div className={styles.nameImg_container}>
                      <img src={img} className={styles.articulo_imagen} alt={item.Nombre}></img>
                    </div>
                    <div className={styles.div_cantidad}>
                      <p>Cant. total: <span>{item.lotesArticulos.length !== 0 ? item.cantGlobal : item.cantidad}</span></p>
                      <div className={styles.lotes_div}>
                          { item.lotesArticulos.length !== 0 && (
                            <p className={styles.cantidad_lotes}>Cant. por lotes: </p>
                          )}
                          {
                            item.lotesArticulos && item.lotesArticulos.map((lote, index)=>(
                                <p key={index}>{lote.nomalmacen}: {lote.cantidadLote}</p>
                            ))
                          }
                      </div>
                      

                      {/*}
                      <div className={styles.div_agregar}>
                        <p onClick={() => restarCantidad(item.Articulo_id)}>-</p>
                        <p onClick={() => sumarCantidad(item.Articulo_id)}>+</p>
                      </div>
                      */}


                    </div>
                    <div className={styles.div_precio}>
                      <p>Precio: ${item.precioArticulo}</p>
                      <p>Subtotal: ${item.lotesArticulos.length !== 0 ? item.precioArticulo * item.cantGlobal : item.precioArticulo * item.cantidad}</p>
                      <p>Descuento: {item.descuento}%</p>
                      <p>
                        Total: $
                        {(
                          (item.lotesArticulos.length !== 0 ? 
                            (item.precioArticulo - (item.precioArticulo * item.descuento / 100)) * item.cantGlobal :
                            (item.precioArticulo - (item.precioArticulo * item.descuento / 100)) * item.cantidad
                          )
                        ).toFixed(2)}
                      </p>

                    </div>
                    <div className={styles.div_editar}>
                        <p onClick={() => eliminarArticulo(item.Articulo_id)} className={styles.articulo_eliminar}><FaRegTrashAlt /></p>
                        <p className={styles.editar} onClick={() => handleEditarArticulo(item)}><FaEdit /></p>
                    </div>
                  </div>
                  <div className={styles.notas}>
                    <p><span>Notas:</span> {item.notas}</p>
                  </div>


                  {/* MODAL EDITAR ARTICULO */}
                  {editarArticulo && articuloEditando === item.Articulo_id && (
                    <>
                    <div className="overlay" />
                    <form className={styles.modal} onSubmit={()=>handleGuardarArticulo(item)}>
                    
                    <div className={styles.articulo_nombreModal}>
                        <h5>{item.Nombre}</h5>
                        <p onClick={()=>setEditarArticulo(false)} className={styles.btn_cerrar}><IoMdClose/></p>
                    </div>

                      <div  className={styles.div_modal}>
                          <div className={styles.campos}>
                            <img className={styles.articulo_img} src={img} alt="" />
                            <p className={styles.articulo_descripcion}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nisi doloremque accusantium at architecto optio nam quam velit voluptas facere veritatis, odit ad odio reiciendis eligendi libero animi. Fugiat, soluta a?</p>
                            <div className={styles.div_camposModal}>
                            <div className={styles.div_cantidad}>
                                <label htmlFor="">Cantidad:</label>
                                <input
                                      type="number"
                                      id="cantidad"
                                      value={cantidad}
                                      min="1"
                                      onChange={(e) => setCantidad(Number(e.target.value))}
                                  />
                                  {/*

                                    <div>
                                      <p onClick={()=>setCantidad(cantidad + 1)}>+</p>
                                      <p onClick={()=> cantidad <= 1 ? "" : setCantidad(cantidad - 1)}>-</p>
                                    </div>

                                  */}
                            </div>
                                <div className={styles.div_precioModal}>
                                    <label className={styles.precio}>Precio: </label>
                                    <input onChange={(e)=>setPrecio(e.target.value)} value={precio} type="number" />
                                </div>
                                <div className={styles.div_precioModal}>
                                    <label>Descuento: </label>
                                    <input onChange={(e)=>setDescuento(e.target.value)} value={descuento} type="number" />
                                </div>
                            </div>
                          </div>
                          <div className={styles.campos}>
                            <label htmlFor="notas">Notas:</label>
                            <textarea
                              id="notas"
                              value={nota}
                              onChange={(e) => setNota(e.target.value)}
                            />
                          </div>
                          <div className={styles.total}>
                            <h3>Total: $<span>{total}</span></h3>
                          </div>
                          
                          <button type="submit">Guardar</button>
                      </div>
              
                    </form>
                  </>
                  )}
                </div>
                {alerta && <div className={styles.overlay} onClick={cancelarEliminar} />}
                <div className={`alertaEliminar ${alerta && "mostrar"}`}>
                  <p>Deseas eliminar todo?</p>
                  <div className={styles.div_confirmacion}>
                    <button onClick={confirmarEliminar}><BiLike /></button>
                    <button onClick={cancelarEliminar}><IoMdClose /></button>
                  </div>
                </div>
              </div>
            )) : (
              <div className={styles.div_carritoVacio}>
                <h4>Agrega articulos al carrito, y los veras aqui.</h4>
                <p><IoCartOutline /></p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.pdf_container}>
          <h3>Previsualización del Ticket</h3>
          <div>
              <button onClick={descargarPDF}>Descargar PDF</button>
              <button onClick={()=>setPreviewUrl("")}><IoMdClose/></button>
          </div>
          <iframe src={previewUrl} width="100%" height="500px" title="Previsualización PDF"></iframe>
        </div>
      )}
    </>
  );
}

