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

    const { cantidadCarrito, usuario } = useCarrito();

    const abrirMenu = () => setActiveComponent("menu");
    const cerrarMenu = () => setActiveComponent(null);


    // Efecto para manejar el activeComponent basado en la ruta
    useEffect(() => {
        if (location.pathname !== "/carrito" && location.pathname !== "/menu") {
            setActiveComponent(null); // Restablece activeComponent si no estás en "/carrito"
        }
    }, [location.pathname, setActiveComponent]);
    

    // Manejar clics fuera del menú
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                cerrarMenu();
            }
        };

        // Escuchar clics en el documento
        document.addEventListener('mousedown', handleClickOutside);
        
        // Limpiar el evento al desmontar el componente
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuRef]);


    const toggleCarrito = () => {
        if (activeComponent === "carrito") {
            setActiveComponent(null); // Oculta el carrito
            navigate(lastRoute); // Navega a la página principal
        } else {
            setLastRoute(location.pathname); // Guarda la última ruta
            setActiveComponent("carrito"); // Muestra el carrito
            navigate("/carrito"); // Navega a la ruta del carrito
        }
    };

    const toggleMenu = () => {
        if (activeComponent === "menu") {
            setActiveComponent(null); // Oculta el menú
            navigate(lastRoute); // Navega a la página principal
        } else {
            setLastRoute(location.pathname);
            setActiveComponent("menu"); // Muestra el menú
            //navigate("/menu"); // Navega a la ruta del menú
        }
    };

    const handleInicio = () => {
        navigate("/grupos");
        setActiveComponent("");
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
        setActiveComponent("");
        setBusquedaParam("")
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
                    <p title={activeComponent === "carrito" ? "Cerrar Carrito" : "Ver carrito"} onClick={toggleCarrito} className={`${styles.carrito} ${activeComponent === "carrito" && styles.active}`}>
                        {activeComponent === "carrito" ? <IoMdClose /> : <IoCartOutline />}
                        {activeComponent !== "carrito" && <span>{cantidadCarrito}</span>}
                    </p>
                    
                    
                    
                </div>
            
            </nav>

            <div className={`${styles.menu_dom} ${activeComponent === "menu" ? styles.mostrar_menu : ""}`}>
                
                {
                    activeComponent === "menu" && (
                        <>
                            <div className={styles.overlay}></div>
                            <div className={styles.menu_container} ref={menuRef}>
                            <p onClick={cerrarMenu} className={styles.close_menu}><IoMdClose/></p>
                                <div className={styles.div_usuario}>
                                    <p className={styles.usuario}>Usuario: <span>{usuario.split(" ")[0]}</span></p>
                                    <p title='Cerrar sesion' onClick={handleCerrarSesion} className={styles.salir}><BiLogOut/></p>
                                </div>

                                <div className={styles.div_opciones}>
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
            
                <div className={`div_buscar ${activeComponent === "buscar" ? "mostrar" : ""}`}>
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


