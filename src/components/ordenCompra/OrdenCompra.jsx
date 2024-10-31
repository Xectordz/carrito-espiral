import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from "../ordenCompra/ordenCompra.module.css"
import { BiLogOut } from "react-icons/bi";

export default function OrdenCompra() {
    const navigate = useNavigate();
    const [ fechaInput, setFechaInput ] = useState(null)

    useEffect(() => {
      const today = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = today.toLocaleDateString('es-ES', options);
      setFechaInput(formattedDate);
    }, []);

    const handleSalir = () => {
        navigate("/grupos")
    }

    const handleOrdenCompra = (e) => {
        e.preventDefault();
    }

  return (
    <>
      <div className='overlay'></div>
      <div className={styles.orden_container}>
        <form onSubmit={handleOrdenCompra} className={styles.orden_form}>
          <h3>Orden de Compra</h3>
          
            <div className={styles.div_form}>
                <p onClick={handleSalir} className={styles.salir}>Salir<span><BiLogOut/></span></p>
                <div className={styles.div_campos}>
                    <label htmlFor="orden">Orden de Compra No: </label>
                    <input id='orden' autoComplete="off" />
                </div>
                <div className={styles.div_campos}>
                    <label htmlFor='fecha'>Fecha:</label>
                    <input id='fecha' value={fechaInput} onChange={()=>{}} type="text" />
                </div>
                
                <h5>Datos del Cliente</h5>
                <div className={styles.div_campos}>
                    <label htmlFor='cliente'>Cliente:</label>
                    <input autoComplete="off" id='cliente' value={""} onChange={()=>{}} type="text" />
                </div>
                <div className={styles.div_campos}>
                    <label htmlFor='direccion'>Direccion:</label>
                    <input autoComplete="off" id='direccion' value={""} onChange={()=>{}} type="text" />
                </div>
                <div className={styles.div_campos}>
                    <label htmlFor='email'>Email:</label>
                    <input autoComplete="off" id='email' value={""} onChange={()=>{}} type="email" />
                </div>
                
                <button  type="submit">Guardar</button>
            </div>
        </form>
      </div>
    </>
  )
}
