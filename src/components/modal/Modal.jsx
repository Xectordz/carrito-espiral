import React, { useState } from 'react';
import styles from "../modal/modal.module.css";
import { IoMdClose } from "react-icons/io";
import { MdAddShoppingCart } from "react-icons/md";
import img from "../../../public/tv.jpg"
import { HiAtSymbol } from 'react-icons/hi';



export default function Modal({
          articuloCarrito,
          cantidad,
          setCantidad,
          notas,
          setNotas,
          total,
          handleSubmit,
          closeModal,
          alertaModal,
          precioArticulo,
          setPrecioArticulo,
          descuento,
          setDescuento
}) {


  return (
    <>
      <div className="overlay" />
      <form className={styles.modal} onSubmit={handleSubmit}>
        
        <div className={styles.articulo_nombre}>
            <h5>{articuloCarrito.Nombre}</h5>
            <p onClick={closeModal} className={styles.btn_cerrar}><IoMdClose/></p>
        </div>
      
      <div className={styles.div_modal}>
          <div className={styles.campos}>
            <img className={styles.articulo_img} src={img} alt="" />
            <p className={styles.articulo_descripcion}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nisi doloremque accusantium at architecto optio nam quam velit voluptas facere veritatis, odit ad odio reiciendis eligendi libero animi. Fugiat, soluta a?</p>
            <div className={styles.div_campos}>
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
                <div className={styles.div_precio}>
                    <label className={styles.precio}>Precio: </label>
                    <input onChange={(e)=>setPrecioArticulo(e.target.value)} min="1" value={`${precioArticulo}`} type="number" />
                </div>
                <div className={styles.div_precio}>
                    <label>Descuento: </label>
                    <input onChange={(e)=>setDescuento(e.target.value)} value={descuento} type="number" />
                </div>
            </div>
          </div>
          <div className={styles.campos}>
            <label htmlFor="notas">Notas:</label>
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          <div className={styles.total}>
            <h3>Total: $<span>{total}</span></h3>
          </div>
          <button type="submit">Agregar al Carrito <MdAddShoppingCart/></button>
      </div>
      

      </form>

        {/* alerta */}

        <div className={` alertaEliminar ${alertaModal && "mostrar"}`}>
            <p>Agrega al menos 1 articulo</p>
        </div>
    </>
  );
}


