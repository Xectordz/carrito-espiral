import React, { useState, useEffect } from 'react';
import styles from "../articulos/articulos.module.css";
/*hooks de react router*/
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
/*iconos de react icons*/
import { MdAddShoppingCart } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa6";
import { MdGridView } from "react-icons/md";
import { MdOutlineViewAgenda } from "react-icons/md";
/*imagen de prueba*/
import img from "../../../public/tv.jpg";
/*componente de Modal*/
import Modal from "../modal/Modal";
/*contexto de carrito*/
import { useCarrito } from '../../context/CarritoContext';
import useGrupoLinea from "../../customHook/useGrupoLinea"



/*Componente Articulos*/
export default function Articulos() {
  const { lineaId } = useGrupoLinea();
  const { alerta, handleAgregar, view, setView, apiURL } = useCarrito(); // extraccion de variables o funciones reciclables del contecto carrito
  //const { lineaId } = useParams(); // extraccion del parametro pasado de la ruta anterior que contiene el id de la linea
  const [loading, setLoading] = useState(true); // variable local de loading
  const [articulos, setArticulos] = useState([]); // variable donde se almacenaran los articulos ya filtrados que coinciden con el id de lineas
  const [articuloCarrito, setArticuloCarrito] = useState({}); //variable para pasarle el objeto del articulo seleccionado al modal y de ahi mostrar sus datos
  const [modal, setModal] = useState(false); // variable mara activar o desactivar el modal
  const [alertaModal, setAlertaModal] = useState(false);//variable para activar o desactivar alerta de modal
  const [ordenarPor, setOrdenarPor] = useState(false); //variable para activar o desactivar las opciones de ordenar articulos
  const navigate = useNavigate();
  const [lotesArticulos ,setLotesArticulos] = useState([]);

  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");
  const [precioArticulo, setPrecioArticulo] = useState(10);
  const [descuento, setDescuento] = useState(0);
  const [total, setTotal] = useState(0);

  /*funcion que calcula el precio de
    articulo por su cantidad*/
    useEffect(() => {
      const precioConDescuento = precioArticulo - (precioArticulo * (descuento / 100));
      setTotal(precioConDescuento * cantidad); // Calcular el total
  }, [cantidad, precioArticulo, descuento]);
  
  /*funcion que realiza el fetch de los articulos
    y filtra solo los que coinciden a la linea
    seleccionada*/
  useEffect(() => {
    setLoading(true);
    fetch(`${apiURL}/get_catalogos_json/articulos`)
      .then(res => res.json())
      .then(data => {
        const filteredArticulos = data.filter(articulo => String(articulo.Linea_Articulo_id) === String(lineaId));
        setArticulos(filteredArticulos);
        setLoading(false); 
      })
      .catch(error => {
        console.error("Error al obtener los artículos:", error);
        setLoading(false); 
      });
  }, [lineaId]);


  /*funcion para activar el modal
    del articulo*/
  const handleModal = (articulo, precio) => {
    setModal(true);
    setArticuloCarrito(articulo);
    setPrecioArticulo(precio);
  };

  /*funcion para agregar al carrito desde
    el modal del articulo*/
  const handleSubmit = (e) => {
    e.preventDefault();
    if(cantidad <= 0){
      setAlertaModal(true);
      setTimeout(() => {
        setAlertaModal(false);
      }, 2000);
      return;
    }
    const itemToAdd = { 
      ...articuloCarrito, 
      cantidad, 
      "cantGlobal": cantidad,
      notas,
      precioArticulo,
      descuento, 
      lotesArticulos
    };
    setLotesArticulos([]);
    handleAgregar(itemToAdd);
    setModal(false);
    setNotas("");
    setCantidad(1);
    setDescuento(0);
    setPrecioArticulo(10);
    console.log(lotesArticulos);
  };
  

  /*Esta funcion agrega un articulo
    desde la vista general, sin necesidad
    de adentrarse al articulo*/
  const handleAgregarArticulos = (articulo) => {
      const itemToAdd = ({ ...articulo, cantidad, notas, precioArticulo, descuento });
      handleAgregar(itemToAdd);
  }

  const closeModal = () => {
    setModal(false);
    setPrecioArticulo(10);
  };

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden'; // Bloquea el scroll
    } else {
      document.body.style.overflow = 'unset'; // Restaura el scroll
    }
  }, [modal]);


  // funcion que ordena articulos segun el parametro que le mandes por ej. de la A a la Z
  const handleOrdenar = (orden) => {
    // Crear una copia de filtrados para no modificar el array original
    const copiaArticulos = [...articulos];
    let ordenados;
      if(orden === "menor"){
        ordenados = articulos.sort((a,b) => a.precioArticulo - b.precioArticulo);
        console.log("ordenados menor a mayor")
        setOrdenarPor(false)
      }else if(orden === "mayor"){
        ordenados = articulos.sort((a,b) => b.precioArticulo - a.precioArticulo);
        console.log("ordenados mayor a menor")
        setOrdenarPor(false)
      }else if(orden === "az"){
        ordenados = copiaArticulos.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        console.log("ordenados de A a Z");
        setOrdenarPor(false)
      }else if(orden === "za"){
        ordenados = copiaArticulos.sort((a, b) => b.Nombre.localeCompare(a.Nombre));
        console.log("ordenados de Z a A");
        setOrdenarPor(false)
      }

      setArticulos(ordenados);
  }


  return (
    <>
    <div className={styles.container}>
    
      {loading ? (

        <div className={styles.div_cargando}>
          <p className={styles.cargando}><FaSpinner /></p>
          <p>Cargando articulos...</p>
        </div>
        
      ) : (

        <>
          <h3>Articulos</h3>
          <div className={`${"alerta"} ${alerta && "mostrar"}`}>
            Agregado <span><BiLike /></span>
          </div>

          <div className={view.grid ? "productos_contenedor" : "productos_contenedor_row"}>
            <div className={styles.views_contenedor}>
              <div className={`${styles.views}`}>
                  <div className={view.grid ? styles.active : ""} onClick={()=>{
                      setView({ grid: true, row: false })
                  }}
                  >
                      <MdGridView/>
                  </div>
                  <div className={view.row ? styles.active : ""} onClick={()=>{
                      setView({ grid: false, row: true })
                  }}>
                      <MdOutlineViewAgenda/>
                  </div>
              </div>
              <div className={styles.ordenar}>
              <p onClick={()=>setOrdenarPor(prev=>!prev)}>Ordenar por </p>
                <div className={`ordenar_container ${ordenarPor ? "mostrar_ordenar" : ""}`}>
                    {
                      ordenarPor && (
                        <div>
                            <p onClick={()=> handleOrdenar("menor")}>Precio(menor a mayor)</p>
                            <p onClick={()=> handleOrdenar("mayor")}>Precio(mayor a menor)</p>
                            <p onClick={()=> handleOrdenar("az")}>Nombre(A a Z)</p>
                            <p onClick={()=> handleOrdenar("za")}>Nombre(Z a A)</p>
                        </div>
                      )
                    }
                </div>
              </div>
              
            </div>
            {
              articulos.length > 0 ? (
                articulos.map((articulo, index) => (
                  <div onClick={() => handleModal(articulo, precioArticulo)} className={view.grid ? "producto_contenedor" : "producto_contenedor_row"} key={index}>
                    <p className={view.row ? "producto_nombre_row" : "producto_nombre"}>{articulo.Nombre}</p>
                    <div className={view.row ? "div_flex" : ""}>
                        <div className={view.row ? "" : ""}>
                            <img className={view.grid ? "producto_imagen" : "producto_imagen_row"} src={img} alt="imagen" /> 
                        </div>
                        <div className={styles.div_info}>
                            <p className={`producto_precio`}>Precio: ${precioArticulo}</p>
                            <p className={`producto_descuento`}>Descuento: {`${descuento} %`}</p>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                //handleAgregarArticulos(articulo);
                                setModal(true);
                            }}>
                              {/*Agregar <span><MdAddShoppingCart /></span>*/}
                              Ver mas
                            </button>
                        </div>
                    </div>

                        {
                          view.row && (
                            <div className="div_descripcion">
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores unde optio suscipit magni aliquid non placeat error ea sequi? Distinctio iusto impedit nam reprehenderit ad est quos harum officia labore.</p>
                            </div>
                          )
                        }
                    
                  </div>
                ))
              ) : (
                <p className={styles.no_disponibles}>No hay artículos disponibles para esta línea.</p>
              )
            }
          </div>
        </>
        
      )}
      
    </div>
      
      {modal && (
        <>
        <Modal
          articuloCarrito={articuloCarrito}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
          alertaModal={alertaModal}
          lotesArticulos={lotesArticulos}
          setLotesArticulos={setLotesArticulos}
          setCantidad={setCantidad}
          cantidad={cantidad}
          setNotas={setNotas}
          notas={notas}
          precioArticulo={precioArticulo}
          setPrecioArticulo={setPrecioArticulo}
          descuento={descuento}
          setDescuento={setDescuento}
          total={total}
        />
        </>
      )}

    </>
  );
}



