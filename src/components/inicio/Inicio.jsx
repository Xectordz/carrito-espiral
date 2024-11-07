import React, { useRef, useState, useEffect } from 'react';
import styles from "../inicio/inicio.module.css";
import { useNavigate } from 'react-router-dom';
import { useCarrito } from "../../context/CarritoContext";
import { IoIosSearch } from "react-icons/io";
import { BiLogOut } from "react-icons/bi";

export default function Inicio() {
  const { setCliente, usuario, setUsuario } = useCarrito();
  const [clienteInput, setClienteInput] = useState('');
  const [claveInput, setClaveInput] = useState('');
  const [fechaInput, setFechaInput] = useState('');
  const [obsInput, setObsInput] = useState('');
  const [isClienteListVisible, setIsClienteListVisible] = useState(false);
  const [isClaveListVisible, setIsClaveListVisible] = useState(false);
  const [selectedClienteIndex, setSelectedClienteIndex] = useState(-1);
  const [selectedClaveIndex, setSelectedClaveIndex] = useState(-1);
  const [alerta, setAlerta] = useState(false);

  const options = [
    {
      "id": 13645,
      "clave": "A1369",
      "nombre": "Proveedora de la Laguna"
    },
    {
      "id": 53645,
      "clave": "b1369",
      "nombre": "Constructira Azteca"
    }
  ];

  const navigate = useNavigate();
  const clienteListRef = useRef();
  const claveListRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const today = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('es-ES', options);
    setFechaInput(formattedDate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clienteListRef.current && !clienteListRef.current.contains(event.target)) {
        setIsClienteListVisible(false);
      }
      if (claveListRef.current && !claveListRef.current.contains(event.target)) {
        setIsClaveListVisible(false);
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
    const exist = options.filter(option => option.nombre.toLowerCase() === clienteInput.toLowerCase());

    if (exist.length > 0) {
      const nuevoCliente = {
        cliente: exist[0].nombre,
        fecha: fechaInput,
        obs: obsInput,
        clave_cliente: exist[0].clave,
        cliente_id: exist[0].id
      };
      setCliente(nuevoCliente);
      localStorage.setItem('cliente', JSON.stringify(nuevoCliente));
      navigate("/grupos");
      localStorage.setItem("existeCliente", "true");
      scrollToTop();
      setAlerta(false);
      console.log(nuevoCliente);
    } else {
      setAlerta(true);
      setTimeout(() => {
        setAlerta(false);
      }, 2000);
    }
  };

  const handleSearchClienteClick = () => {
    if (clienteInput) {
      const coincide = options.filter(option => option.nombre.toLowerCase().includes(clienteInput.toLowerCase()));
      setIsClienteListVisible(coincide.length > 0);
      setSelectedClienteIndex(-1);
      inputRef.current.focus();
    }
  };

  const handleSearchClaveClick = () => {
    if (claveInput) {
      const coincide = options.filter(option => option.clave.toLowerCase().includes(claveInput.toLowerCase()));
      setIsClaveListVisible(coincide.length > 0);
      setSelectedClaveIndex(-1);
      inputRef.current.focus();
    }
  };

  const handleClienteOptionClick = (option) => {
    setClaveInput(option.clave);
    setClienteInput(option.nombre);
    setIsClienteListVisible(false);
  };

  const handleClaveOptionClick = (option) => {
    setClienteInput(option.nombre);
    setClaveInput(option.clave);
    setIsClaveListVisible(false);
  };

  const handleKeyDown = (e) => {
    const filteredClienteOptions = options.filter(option => option.nombre.toLowerCase().includes(clienteInput.toLowerCase()));
    const filteredClaveOptions = options.filter(option => option.clave.toLowerCase().includes(claveInput.toLowerCase()));

    if (isClienteListVisible) {
      if (e.key === 'ArrowDown' || e.key === "Tab") {
        setSelectedClienteIndex((prevIndex) => (prevIndex + 1) % filteredClienteOptions.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedClienteIndex((prevIndex) => (prevIndex - 1 + filteredClienteOptions.length) % filteredClienteOptions.length);
        e.preventDefault();
      } else if (e.key === 'Enter' && selectedClienteIndex >= 0) {
        handleClienteOptionClick(filteredClienteOptions[selectedClienteIndex]);
        e.preventDefault();
      }
    }

    if (isClaveListVisible) {
      if (e.key === 'ArrowDown' || e.key === "Tab") {
        setSelectedClaveIndex((prevIndex) => (prevIndex + 1) % filteredClaveOptions.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedClaveIndex((prevIndex) => (prevIndex - 1 + filteredClaveOptions.length) % filteredClaveOptions.length);
        e.preventDefault();
      } else if (e.key === 'Enter' && selectedClaveIndex >= 0) {
        handleClaveOptionClick(filteredClaveOptions[selectedClaveIndex]);
        e.preventDefault();
      }
    }

    if (e.key === 'Enter') {
      handleSearchClienteClick();
      handleSearchClaveClick();
      e.preventDefault();
    }
  };

  const handleCerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem("existeUsuario");
    navigate("/login");
  };

  return (
    <>
      <div className='overlay'></div>
      <div className={styles.inicio_container}>
        <form onSubmit={handleSubmit} className={styles.inicio_form}>
          <h3>Cliente</h3>
          <div className={styles.div_usuario}>
            <p>Usuario: <span>{usuario}</span></p>
            <p onClick={handleCerrarSesion}><BiLogOut /></p>
          </div>
          <div className={styles.div_form}>
            {/* Clave  */}
            <div className={styles.div_cliente}>
              <label htmlFor="clave">Clave: </label>
              <input
                ref={inputRef}
                type="text"
                id="clave"
                value={claveInput}
                onChange={(e) => setClaveInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <p className={styles.buscar_cliente} onClick={handleSearchClaveClick}>
                <IoIosSearch />
              </p>
              {isClaveListVisible && claveInput && (
                <ul className={styles.lista_clientes} ref={claveListRef}>
                  {options.filter(option =>
                    option.clave.toLowerCase().includes(claveInput.toLowerCase())
                  ).map((filteredOption, index) => (
                    <li
                      key={filteredOption.id}
                      onClick={() => handleClaveOptionClick(filteredOption)}
                      className={selectedClaveIndex === index ? styles.selected : ''}
                    >
                      {filteredOption.clave}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Cliente Field */}
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
              <p className={styles.buscar_cliente} onClick={handleSearchClienteClick}>
                <IoIosSearch />
              </p>
              {isClienteListVisible && clienteInput && (
                <ul className={styles.lista_clientes} ref={clienteListRef}>
                  {options.filter(option =>
                    option.nombre.toLowerCase().includes(clienteInput.toLowerCase())
                  ).map((filteredOption, index) => (
                    <li
                      key={filteredOption.id}
                      onClick={() => handleClienteOptionClick(filteredOption)}
                      className={selectedClienteIndex === index ? styles.selected : ''}
                    >
                      {filteredOption.nombre}
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
              <input value={fechaInput} onChange={() => {}} type="text" />
            </div>
            {alerta && (
              <div className={`${styles.alerta_cliente} ${alerta ? styles.mostrar_alerta : ""}`}>
                <p>Debes agregar un cliente válido</p>
              </div>
            )}
            <button type="submit">Entrar</button>
          </div>
        </form>
      </div>
    </>
  );
}








