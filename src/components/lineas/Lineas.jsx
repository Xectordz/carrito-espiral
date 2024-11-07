import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from "../lineas/lineas.module.css"
import { useNavigate } from 'react-router-dom';
import img from "../../../public/deportes.jpg"
import { useCarrito } from "../../context/CarritoContext"
import useGrupoLinea from '../../customHook/useGrupoLinea';



export default function Lineas() {
  const { grupoId, setLineaId } = useGrupoLinea();
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { apiURL } = useCarrito();

  useEffect(() => {
    setLoading(true); // Comenzar la carga
    fetch(`${apiURL}/get_catalogos_json/lineas_articulos`)
      .then(res => res.json())
      .then(data => {
        const filteredLineas = data.filter(linea => String(linea.Grupo_Linea_Id) === String(grupoId));
        setLineas(filteredLineas);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al obtener las líneas:", error);
        setLoading(false); 
      });
  }, [grupoId]);

  const handleLinea = (lineaId) => {
    setLineaId(lineaId);
    localStorage.setItem("lineaId", JSON.stringify(lineaId));
    navigate(`/articulos`);
  }


  return (
    <div className={styles.container}>
      <h3>Líneas del grupo: {}</h3>
      <div className={`${lineas.length <= 1 ? "column" : "items_contenedor"}`}>
          {
            lineas.map((linea, index) => (
              <div key={index} onClick={()=>handleLinea(linea.Linea_Articulo_Id)} className="item_contenedor">
                <img src={img} alt="" />
                <div className='div_nombre_item'>
                    <p>{linea.Nombre}</p>
                </div>
              </div>
            ))
          }
      </div>
    </div>
  );
}
