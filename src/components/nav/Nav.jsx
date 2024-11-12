import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from "../nav/nav.module.css";
import { RiMenu2Line } from "react-icons/ri";
import { IoCartOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import { BiLogOut } from "react-icons/bi";
import { useLocation, useNavigate } from 'react-router-dom';
import Grupos from '../grupos/Grupos';
import { useCarrito } from '../../context/CarritoContext';

export default function Nav({ activeComponent, setActiveComponent }) {
    const navigate = useNavigate();
    const [lastRoute, setLastRoute] = useState("/");
    const location = useLocation();
    const [showCategorias, setShowCategorias] = useState(false); // Estado para mostrar categorías
    const [busquedaParam, setBusquedaParam] = useState("");
    const menuRef = useRef(null);
    const buscarRef = useRef(null);
    const [isCarritoActive, setIsCarritoActive] = useState(false);

    const { cantidadCarrito, usuario } = useCarrito();

    const abrirMenu = () => setActiveComponent("menu");
    const cerrarMenu = () => setActiveComponent(null);

    // Efecto para manejar el activeComponent basado en la ruta
    useEffect(() => {
        if (location.pathname !== "/carrito" && location.pathname !== "/menu") {
            setActiveComponent(null); // Restablece activeComponent si no estás en "/carrito"
        }
    }, [location.pathname, setActiveComponent]);
    
    // Manejar clics fuera del menú y buscar
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Verifica si el clic está fuera del menú o de la búsqueda
            if (menuRef.current && !menuRef.current.contains(event.target) && activeComponent === "menu") {
                cerrarMenu();
            }
            
            if (buscarRef.current && !buscarRef.current.contains(event.target) && activeComponent === "buscar") {
                setActiveComponent(null);
            }
        };

        // Escuchar clics en el documento
        document.addEventListener('mousedown', handleClickOutside);
        
        // Limpiar el evento al desmontar el componente
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeComponent]);  // Solo vuelve a ejecutar si `activeComponent` cambia

    const toggleCarrito = () => {
        if (isCarritoActive) {
            setIsCarritoActive(false) // Oculta el carrito
            // Si la última ruta está disponible, navega a ella, sino navega al inicio
            if (lastRoute && lastRoute !== "/carrito") {
                navigate(lastRoute); // Navega a la última ruta
            } else {
                navigate("/"); // Navega a la página principal si no hay última ruta
            }
        } else {
            setLastRoute(location.pathname);
            setIsCarritoActive(true); // Muestra el carrito
            navigate("/carrito"); // Navega a la ruta del carrito
        }
    };

    const toggleMenu = () => {
        if (activeComponent === "menu") {
            setActiveComponent(null); // Oculta el menú
        } else {
            setLastRoute(location.pathname);
            setActiveComponent("menu"); // Muestra el menú
            //navigate("/menu"); // Navega a la ruta del menú
        }
    };

    const handleInicio = () => {
        navigate("/grupos");
        setActiveComponent(null);
    };

    const toggleBuscar = () => {
        if(activeComponent === "buscar"){
            setActiveComponent(null);
        }else {
            setActiveComponent("buscar");
        }
    }

    const handleBusqueda = (e) => {
        e.preventDefault();
        navigate(`/busqueda/results/${busquedaParam}`);
        setActiveComponent(null);
        setBusquedaParam("");
    }

    const handleCerrarSesion = () => {
        navigate("/login");
        localStorage.removeItem("existeUsuario");
        localStorage.removeItem("existeCliente");
        localStorage.removeItem("cliente");
    }

    const handleVenta = () => {
        setActiveComponent(null);
        localStorage.removeItem("existeCliente");
        navigate("/");
    }

    const handleOrdenVenta = () => {
        navigate("/ordenCompra");
        cerrarMenu();
    }

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <div className={styles.div_menu}>
                    {/*boton Menu actualmente inactivo*/}
                    <p title='Ver Menu' onClick={toggleMenu} className={`${styles.menu} ${activeComponent === "menu" && styles.active}`}>
                        <RiMenu2Line />
                    </p>
                    <h2 onClick={handleInicio}>EspiralS</h2>
                </div>
                
                {showCategorias && <Grupos />} {/* Renderiza el componente de categorías aquí */}
                <div className={styles.iconos_contenedor}>
                    <p title={activeComponent === "buscar" ? "Cerrar Busqueda" : "Buscar Articulo"} onClick={toggleBuscar} className={`${styles.buscar} ${activeComponent === "buscar" && styles.active}`}>
                        {
                            activeComponent === "buscar" ? (
                                <IoMdClose/>
                            ) : (
                                <IoIosSearch/>
                            )
                        }
                    </p>
                    <p title={isCarritoActive ? "Cerrar Carrito" : "Ver carrito"} onClick={toggleCarrito} className={`${styles.carrito} ${isCarritoActive && styles.active}`}>
                        {isCarritoActive ? <IoMdClose /> : <IoCartOutline />}
                        {!isCarritoActive && <span>{cantidadCarrito}</span>}
                    </p>
                </div>
            </nav>

            <div ref={menuRef} className={`${styles.menu_dom} ${activeComponent === "menu" ? styles.mostrar_menu : ""}`}>
                {
                    activeComponent === "menu" && (
                        <>
                            <div className={styles.overlay}></div>
                            <div className={styles.menu_container} >
                                <p onClick={cerrarMenu} className={styles.close_menu}><IoMdClose/></p>
                                <div className={styles.div_usuario}>
                                    <p className={styles.usuario}>Usuario: <span>{usuario.split(" ")[0]}</span></p>
                                    <p title='Cerrar sesion' onClick={handleCerrarSesion} className={styles.salir}><BiLogOut/></p>
                                </div>

                                <div className={styles.div_opciones}>
                                    <div onClick={()=>navigate("/grupos")}>
                                        <p>Ver Grupos</p>
                                    </div>
                                    <div onClick={handleVenta}>
                                        <p>Venta</p>
                                    </div>
                                    <div onClick={handleOrdenVenta}>
                                        <p>Orden de Compra</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
            
            <div ref={buscarRef} className={`div_buscar ${activeComponent === "buscar" ? "mostrar" : ""}`}>
                {
                    activeComponent === "buscar" && (
                        <form className={`${styles.buscar_contenedor} ${activeComponent === "buscar" ? styles.activeInput : ''}`}>
                            <div className={styles.modal_busqueda}>
                                <div className={styles.div_busca}>
                                    <input value={busquedaParam} onChange={(e)=>setBusquedaParam(e.target.value)} type="text" />
                                    <button disabled={busquedaParam.trim() === ""} onClick={handleBusqueda}>Buscar</button>
                                </div>  
                            </div>
                        </form>
                    )
                }
            </div>
        </div>
    );
}



