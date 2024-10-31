import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import img from "../../../public/tv.jpg";
import { MdAddShoppingCart } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa6";
import styles from "../busqueda/busqueda.module.css";
import Modal from '../modal/Modal';
import { MdGridView } from "react-icons/md";
import { MdOutlineViewAgenda } from "react-icons/md";
import { useCarrito } from '../../context/CarritoContext';
import { BsArrowReturnLeft } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';



export default function Busqueda() {
    const { alerta, handleAgregar, view, setView, cantidad, setCantidad, precioArticulo, setPrecioArticulo, notas, setNotas, descuento, setDescuento, total, setTotal, apiURL } = useCarrito();
    const [articulos, setArticulos] = useState([]);
    const [filtrados, setFiltrados] = useState([]);
    const { searchTerm } = useParams();
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [articuloCarrito, setArticuloCarrito] = useState([]);
    const [alertaModal, setAlertaModal] = useState(false);
    const [ordenarPor, setOrdenarPor] = useState(false);
    const navigate = useNavigate();
    

    /*fetch de los articulos y se almacenan en 
      la variable de estado articulos*/
    useEffect(() => {
        setLoading(true);
        const fetchArticulos = async () => {
            try {
              const res = await fetch(`${apiURL}/get_articulo_json`);
              const data = await res.json();
              setArticulos(data);
            } catch {
              console.log("Error al obtener los articulos:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchArticulos();
        
      }, []);

    /*filtra todos los articulos que contienen el
      parametro de la busqueda, del array que contiene todos,
      y guarda los filtrados en la variable filtrados*/
    useEffect(()=>{
        const resultados = articulos.filter( articulo => 
          articulo.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFiltrados(resultados);
    }, [articulos, searchTerm]);


    useEffect(() => {
      if (modal) {
        document.body.style.overflow = 'hidden'; // Bloquea el scroll
      } else {
        document.body.style.overflow = 'unset'; // Restaura el scroll
      }
    }, [modal]);


    /*funcion para activar el modal 
    del articulo*/
    const handleModal = (articulo, precio) => {
      setModal(true);
      setArticuloCarrito(articulo);
      setPrecioArticulo(precio);
    };

    /*Esta funcion agrega un articulo
    desde la vista general, sin necesidad
    de adentrarse al articulo*/
    const handleAgregarArticulos = (articulo) => {
      const itemToAdd = ({ ...articulo, cantidad, notas, precioArticulo, descuento });
      handleAgregar(itemToAdd);
    }


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
      const itemToAdd = ({ ...articuloCarrito, cantidad, notas, precioArticulo, descuento });
      handleAgregar(itemToAdd);
      setModal(false);
      setNotas("");
      setCantidad(1);
      setDescuento(0);
      setPrecioArticulo(10);
    };

    const closeModal = () => {
      setModal(false);
    };


    const handleOrdenar = (orden) => {
      // Crear una copia de filtrados para no modificar el array original
      const copiaFiltrados = [...filtrados];
      let ordenados;
        if(orden === "menor"){
          ordenados = filtrados.sort((a,b) => a.precioArticulo - b.precioArticulo);
          console.log("ordenados menor a mayor")
          setOrdenarPor(false)
        }else if(orden === "mayor"){
          ordenados = filtrados.sort((a,b) => b.precioArticulo - a.precioArticulo);
          console.log("ordenados mayor a menor")
          setOrdenarPor(false)
        }else if(orden === "az"){
          ordenados = copiaFiltrados.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
          console.log("ordenados de A a Z");
          setOrdenarPor(false)
        }else if(orden === "za"){
          ordenados = copiaFiltrados.sort((a, b) => b.Nombre.localeCompare(a.Nombre));
          console.log("ordenados de Z a A");
          setOrdenarPor(false)
        }

        setFiltrados(ordenados);
    }

  return (
    <>
      <div className={styles.container}>
        {
          loading ? (

              <div className={styles.div_cargando}>
                  <p className={styles.cargando}><FaSpinner /></p>
                  <p>Cargando articulos...</p>
              </div>

          ) : (
            <>

              <h3>Resultados de busqueda</h3>
              <div className={`alerta ${alerta ? "mostrar" : ""}`}>
                Agregado <span><BiLike /></span>
              </div>

              <div className={ view.grid ? "productos_contenedor" : "productos_contenedor_row"}>
                
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
                    {
                      ordenarPor && (
                        <div className={styles.ordenar_container}>
                          <p onClick={()=> handleOrdenar("menor")}>Precio(menor a mayor)</p>
                          <p onClick={()=> handleOrdenar("mayor")}>Precio(mayor a menor)</p>
                          <p onClick={()=> handleOrdenar("az")}>Nombre(A a Z)</p>
                          <p onClick={()=> handleOrdenar("za")}>Nombre(Z a A)</p>
                        </div>
                      )
                    }
                  </div>
              
              </div>

                  {
                    filtrados.length > 0 ? (
                      filtrados.map(( articulo, index )=>(

                        <div onClick={() => handleModal(articulo, precioArticulo)} className={view.grid ? "producto_contenedor" : "producto_contenedor_row"} key={index}>
                            <p className={view.row ? "producto_nombre_row" : "producto_nombre"}>{articulo.Nombre}</p>
                            <div className={view.row ? "div_flex" : ""}>
                                <div className={view.row ? "" : ""}>
                                    <img className={view.grid ? "producto_imagen" : "producto_imagen_row"} src={img} alt="" />
                                </div>
                                <div className={styles.div_info}>
                                    <p className={`producto_precio`}>Precio: $ {precioArticulo}</p>
                                    <p className={`producto_descuento`}>Descuento: {`${descuento} %`}</p>
                                    <button onClick={(e)=>{
                                        e.stopPropagation();
                                        handleAgregarArticulos(articulo);
                                    }}
                                    >
                                        Agregar <span><MdAddShoppingCart/></span>
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
                      
                      <p className={styles.no_disponibles}>No se encontraron resultados para esa busqueda, intenta de nuevo</p>
                      
                    )
                  }
              </div>

            </>
          )
        }
      </div>


      {modal && (
        <Modal
          articuloCarrito={articuloCarrito}
          cantidad={cantidad}
          setCantidad={setCantidad}
          notas={notas}
          setNotas={setNotas}
          total={total}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
          alertaModal={alertaModal}
          precioArticulo={precioArticulo}
          setPrecioArticulo={setPrecioArticulo}
          descuento={descuento}
          setDescuento={setDescuento}
        />
      )}


    </>

  )
}
