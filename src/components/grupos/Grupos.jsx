import styles from './grupos.module.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import img from "../../../public/deportes.jpg"
import { BiLogOut } from "react-icons/bi";
import { useCarrito } from "../../context/CarritoContext"
import  useGrupoLinea  from "../../customHook/useGrupoLinea"
import SHA256 from "crypto-js/sha256";



export default function Grupos() {
  const { setGrupoId } = useGrupoLinea();
  const { cliente, setCliente, setCarrito, apiURL } = useCarrito();
  const [grupos, setGrupos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    fetch(`${apiURL}/get_catalogos_json/grupos_lineas`)
      .then(res => res.json())
      .then(data => {
        setGrupos(data);
      });

    fetch(`${apiURL}/get_catalogos_json/lineas_articulos`)
      .then(res => res.json())
      .then(data => {
        setLineas(data);
      });
  }, []);

  const handleGroupClick = (grupoId) => {
    setGrupoId(grupoId);

    // Codificar grupoId a Base64 antes de almacenarlo
    const encodedGrupoId = btoa(JSON.stringify(grupoId));

    // Almacenar el grupoId codificado en localStorage
    localStorage.setItem("grupoId", encodedGrupoId);

    // Navegar a la ruta /lineas
    navigate(`/lineas`);
  };



  const handleCambiarCliente = () => {
      navigate("/");
      setCliente({
          cliente: "",
          fecha: "",
          obs: ""
      });
      
      setCarrito([]);
      localStorage.removeItem("carrito");
      localStorage.removeItem("existeCliente");

  }

  return (
    <div className={styles.container}>
      <div className={styles.div_cliente}>
        <p>Cliente: <span>{cliente.cliente}</span></p>
        <div onClick={handleCambiarCliente} className={styles.cambiar_cliente}>
            {/*<p>Cambiar cliente</p>*/}
            <p title='Nuevo cliente'><BiLogOut/></p>
        </div>
      </div>
      <h3 className={styles.titulo_grupos}>Grupos</h3>
      <div className="items_contenedor">
        {grupos.filter(grupo => 
          lineas.some(linea => linea.Grupo_Linea_Id === grupo.Grupo_linea_id)
        ).map((grupo, index) => {
          // Filtrar las líneas relacionadas para el grupo actual
          const relatedLineas = lineas.filter(linea => linea.Grupo_Linea_Id === grupo.Grupo_linea_id);

          return (
            <div key={index}>
                <div
                  onClick={() => handleGroupClick(grupo.Grupo_linea_id)}
                  className="item_contenedor"
                >

                      <img src={img} alt="" />
                      <div className="div_nombre_item">
                        <p>{grupo.Nombre}</p>
                      </div>
       
                </div>
            </div>
          );


        })}
      </div>
    </div>
  );
}







