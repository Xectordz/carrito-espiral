import React, { useRef, useState, useEffect } from 'react';
import styles from "../inicio/inicio.module.css";
import { useNavigate } from 'react-router-dom';
import { useCarrito } from "../../context/CarritoContext";
import { IoIosSearch } from "react-icons/io";
import { BiLogOut } from "react-icons/bi";

export default function Inicio() {
  const { setCliente, usuario, setUsuario } = useCarrito();
  const [clienteInput, setClienteInput] = useState('');
  const [fechaInput, setFechaInput] = useState('');
  const [obsInput, setObsInput] = useState("");
  const [isListVisible, setIsListVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [alerta, setAlerta] = useState(false);
  const options = ['Cliente 1', 'Cliente 2', 'Cliente 3', "Cliente 4", "Cliente 5" , "Hector Rodriguez", "Hector Reyes"];
  const navigate = useNavigate();
  const listRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const today = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('es-ES', options);
    setFechaInput(formattedDate);
  }, []);

  
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listRef.current && !listRef.current.contains(event.target)) {
        setIsListVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const exist = options.filter(option=>option === clienteInput);

    if (exist.length > 0) {
      const nuevoCliente = {
        cliente: clienteInput,
        fecha: fechaInput,
        obs: obsInput,
        clave_cliente: 12312, 
        cliente_id: 123123
      };
      setCliente(nuevoCliente);
      localStorage.setItem('cliente', JSON.stringify(nuevoCliente));
      navigate("/grupos");
      localStorage.setItem("existeCliente", "true");
      scrollToTop();
      setAlerta(false);
    } else {
      setAlerta(true);
      setTimeout(() => {
        setAlerta(false);
      }, 2000);
    }
  };

  const handleSearchClick = () => {
    if (clienteInput) {
      const coincide = options.filter(option => option.toLowerCase().includes(clienteInput.toLowerCase()));
      setIsListVisible(coincide.length > 0);
      setSelectedIndex(-1); // Resetear el índice
      inputRef.current.focus(); //mantener el foco en input para poder desplazarte en los resultados de clientes
    }
  };

  const handleOptionClick = (option) => {
    setClienteInput(option);
    setIsListVisible(false);
  };

  const handleKeyDown = (e) => {

      const filters = options.filter(option => option.toLowerCase().includes(clienteInput.toLowerCase()));
      
      if (isListVisible) {
        if (e.key === 'ArrowDown' || e.key === "Tab") {
          setSelectedIndex((prevIndex) => (prevIndex + 1) % filters.length);
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          setSelectedIndex((prevIndex) => (prevIndex - 1 + filters.length) % filters.length);
          e.preventDefault();
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          handleOptionClick(filters[selectedIndex]);
          e.preventDefault();
        }
      }

      if (e.key === 'Enter') {
        handleSearchClick();
        e.preventDefault();
      }

  };

  const handleCerrarSesion = () => {
      setUsuario(null);
      localStorage.removeItem("existeUsuario");
      navigate("/login");
  }

  return (
    <>
      <div className='overlay'></div>
      <div className={styles.inicio_container}>
        <form onSubmit={handleSubmit} className={styles.inicio_form}>
          <h3>Cliente</h3>
          <div className={styles.div_usuario}>
            <p>Usuario: <span>{usuario}</span></p>
            <p onClick={handleCerrarSesion}><BiLogOut/></p>
          </div>
          <div className={styles.div_form}>
            <div className={styles.div_cliente}>
              <label htmlFor="cliente">Cliente: </label>
              <input
              ref={inputRef}
                type="text"
                id="cliente"
                value={clienteInput}
                onChange={(e) => setClienteInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <p className={styles.buscar_cliente} onClick={handleSearchClick}>
                <IoIosSearch />
              </p>
              {isListVisible && clienteInput && (
                <ul className={styles.lista_clientes} ref={listRef}>
                  {options.filter(option =>
                    option.toLowerCase().includes(clienteInput.toLowerCase())
                  ).map((filteredOption, index) => (
                    <li
                      key={index}
                      onClick={() => handleOptionClick(filteredOption)}
                      className={selectedIndex === index ? styles.selected : ''}
                    >
                      {filteredOption}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className={styles.div_observaciones}>
              <label htmlFor="obs">Observaciones: </label>
              <textarea className={styles.textarea} value={obsInput} onChange={(e) => setObsInput(e.target.value)} id="obs"></textarea>
            </div>
            <div className={styles.div_fecha}>
              <label>Fecha:</label>
              <input value={fechaInput} onChange={()=>{}} type="text" />
            </div>
            {
              alerta && (
                <div className={`${styles.alerta_cliente} ${alerta ? styles.mostrar_alerta : ""}`}>
                  <p>Debes agregar un cliente valido</p>
                </div>
              )
            }
            <button  type="submit">Entrar</button>
          </div>
        </form>
      </div>
    </>
  );
}







