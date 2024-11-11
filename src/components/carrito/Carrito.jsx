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
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const navigate = useNavigate();
  const [lotes, setLotes] = useState([]);
  const [cantidadPorLote, setCantidadPorLote] = useState({});  // Estado para la cantidad seleccionada por lote
  const [lotesArticulosEditados, setLotesArticulosEditados] = useState([]);
  const [lotesDisp, setLotesDisp] = useState([]);
  const [indexEditado, setIndexEditado] = useState("");
  const [mensaje, setMensaje] = useState(false);
  

  // Función que calcula el total con descuento
  const calcularTotalModal = (precioArticulo, cantidad, descuento) => {
    if (precioArticulo && cantidad && descuento !== undefined) {
        const precioConDescuento = precioArticulo - (precioArticulo * (descuento / 100));
        return precioConDescuento * cantidad;
    }
    return 0; // Retorna 0 si los valores no son válidos
  };

  // Usamos useEffect para recalcular el total cada vez que cambien los valores dentro del modal
  useEffect(() => {
    if (editarArticulo && articuloEditando) {
        // Recalcular el total con los valores actuales del artículo
        const nuevoTotal = calcularTotalModal(articuloEditando.precioArticulo, cantidad, articuloEditando.descuento);
        setTotal(nuevoTotal); // Actualizar el estado total con el valor calculado
      }
  }, [articuloEditando, editarArticulo, cantidad]);  // Recalcular cuando articuloEditando o editarArticulo cambien


  const { carrito, setCarrito, cantidadCarrito, cliente, apiURL } = useCarrito();


  const fetchLotes = async () => {
    // Asegúrate de que 'articuloEditando' y 'Articulo_id' están definidos
    if (articuloEditando && articuloEditando.Articulo_id) {
        
        try {
            // Hacemos la petición y esperamos la respuesta
            const response = await fetch(`${apiURL}/get_lotes_json/${articuloEditando.Articulo_id}`);
            
            // Verificamos si la respuesta es válida
            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
            }
            
            // Parseamos el cuerpo de la respuesta a JSON
            const data = await response.json();
            
            // Verifica si 'data' es un array antes de continuar

            if (Array.isArray(data)) {
                // Mapeamos los lotes de la API, agregando el campo 'cantidadLote' de 'articuloEditando.lotesArticulos'
                const lotesFiltrados = data.map(lote => {
                    // Busca el lote correspondiente en articuloEditando.lotesArticulos
                    const loteEdit = articuloEditando.lotesArticulos.find(l => l.artdiscretoid === lote.artdiscretoid);
                    
                    
                    if (loteEdit) {
                        // Si encontramos el lote correspondiente, le agregamos el campo cantidadLote
                        return {
                            ...lote,  // Mantén todas las propiedades del lote
                            cantidadLote: loteEdit.cantidadLote  // Si no existe, por defecto será 0
                        };
                    }

                    // Si no se encuentra el lote en articuloEditando.lotesArticulos, devolvemos el lote original
                    return lote;
                });

                // Actualiza el estado con los lotes filtrados y con el campo cantidadLote añadido
                setLotes(lotesFiltrados);
            } else {
                console.error("La respuesta no es un array de lotes");
            }
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
        }
    } else {
        console.error('No se ha definido articuloEditando o Articulo_id');
    }
};

useEffect(() => {
  // Verifica que articuloEditando y Articulo_id están definidos
  if (articuloEditando && articuloEditando.Articulo_id) {
      fetchLotes();
  }
}, [articuloEditando]);

 
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

  const eliminarArticulo = (index) => {
    // Filtra los artículos que no coincidan con el id que deseas eliminar
    const nuevoCarrito = carrito.filter((item, idx) => idx !== index);
    
    // Actualiza el estado del carrito
    setCarrito(nuevoCarrito);
  
    // Codifica el carrito en base64 antes de almacenarlo
    const carritoBase64 = btoa(JSON.stringify(nuevoCarrito));
    
    // Almacena el carrito codificado en base64 en localStorage
    localStorage.setItem("carrito", carritoBase64);
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

 // Definir la función calcularTotal que actualiza el estado total
const calcularTotal = () => {
  let total = 0;

  carrito.forEach(item => {
    const cantidadArticulo = item.cantGlobal;
    const precioConDescuento = item.precioArticulo - (item.precioArticulo * item.descuento / 100);
    const totalArticulo = precioConDescuento * cantidadArticulo;
    total += totalArticulo;
  });

  return total.toFixed(2);  // Devolver el total calculado con dos decimales
};


// Usar useEffect para ejecutar el cálculo solo cuando el carrito cambia
useEffect(() => {
  calcularTotal(); // Calcular el total solo cuando el carrito cambie
}, [carrito]);  // Dependencia de carrito, así que solo se recalcula cuando el carrito cambia

  


  const handleComprar = () => {
      
      const detalles = carrito.map(item => ({
          'articuloId': item.Articulo_id,
          'claveArticulo': item.Clave_articulo,
          'unidades': item.cantGlobal,
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


const recuperarCarrito = () => {
  const carritoBase64 = localStorage.getItem('carrito');
  
  if (carritoBase64) {
    try {
      // Decodificamos el carrito de Base64 a JSON
      const carritoDecoded = JSON.parse(atob(carritoBase64));
      setCarrito(carritoDecoded);
    } catch (error) {
      console.error("Error al decodificar carrito desde Base64", error);
    }
  }
};

// Recuperar el carrito al montar el componente
useEffect(() => {
  recuperarCarrito();
}, []);

const handleEditarArticulo = (item) => {
  setArticuloEditando(item);
  setNota(item.notas);
  setPrecio(item.precioArticulo);
  setDescuento(item.descuento);
  setCantidad(item.cantGlobal);
  setEditarArticulo(true);
  setLotesDisp(item.lotesArticulos);
  
};



const handleGuardarArticulo = (item) => {
  // Calcular la suma de las cantidades de los lotes editados
  const sumaLotes = lotesArticulosEditados.reduce((total, lote) => total + lote.cantidadLote, 0);

  // Verificar si la suma de las cantidades de los lotes no sobrepasa la cantidad total
  if ( articuloEditando.lotesArticulos.length !== 0 && sumaLotes !== cantidad) {
    // Si la suma es mayor a la cantidad total, mostrar un mensaje de error
    alert('La suma de las cantidades de los lotes no puede ser diferente a la cantidad total del artículo.');
    setLotesArticulosEditados([]);
    return;
  }

  // Si la validación pasa, procedemos a editar el artículo en el carrito
  const editado = carrito.map((articulo, index) =>
    index === indexEditado
      ? {
          ...articulo,
          notas: nota.trim(),
          precioArticulo: precio,
          descuento: descuento,
          cantGlobal: cantidad,
          lotesArticulos: lotesArticulosEditados,
        }
      : articulo
  );

  // Codificamos el carrito a Base64 antes de almacenarlo
  const carritoBase64 = btoa(JSON.stringify(editado));

  // Guardamos el carrito codificado en Base64 en localStorage
  localStorage.setItem("carrito", carritoBase64);

  // Establecer el carrito actualizado en el estado
  setCarrito(editado);

  // Limpiar los campos y cerrar la ventana de edición
  setNota("");
  setEditarArticulo(false);
  setArticuloEditando(null); 
  setLotesArticulosEditados([]);
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
      console.log(cantidadPorLote)
      // Actualiza lotesArticulos solo si el artículo no existe en el array
      setLotesArticulosEditados(prev => {
        
        const index = prev.findIndex(item => item.artdiscretoid === artdiscretoid);
  
        if (index === -1) {
          // Si no existe, agregar nuevo artículo
          return [
            ...prev,
            { nomalmacen, artdiscretoid, cantidadLote: value }
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

  // formatear la fecha que trae el lote
  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha); // Convierte la fecha a un objeto Date
    return fechaObj.toLocaleDateString('es-ES'); // Devuelve la fecha en formato 'dd/mm/yyyy'
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
                      <p>Cant. total: <span>{item.cantGlobal}</span></p>
                      <div className={styles.lotes_div_carrito}>
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
                      <p>Subtotal: ${item.precioArticulo * item.cantGlobal}</p>
                      <p>Descuento: {item.descuento}%</p>
                      <p>
                          Total: $
                          {((item.precioArticulo - (item.precioArticulo * item.descuento / 100)) * item.cantGlobal).toFixed(2)}
                      </p>


                    </div>
                    <div className={styles.div_editar}>
                        <p onClick={() => eliminarArticulo(index)} className={styles.articulo_eliminar}><FaRegTrashAlt /></p>
                        <p className={styles.editar} 
                        onClick={() => {
                            handleEditarArticulo(item);
                            setIndexEditado(index);
                        }}><FaEdit /></p>
                    </div>
                  </div>
                  <div className={styles.notas}>
                    <p><span>Notas:</span> {item.notas}</p>
                  </div>


                  {/* MODAL EDITAR ARTICULO */}
                  {editarArticulo && articuloEditando.Articulo_id === item.Articulo_id && (
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
                          <div className={styles.lotes_div}>
                            {
                              lotes.length !== 0 && (
                                  lotes.map((lote, index)=>(
                                    <div 
                                      key={index} 
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
                                  ))
                              )
                            }
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

